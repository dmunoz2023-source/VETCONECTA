import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { AppointmentsRepository } from '../repositories/appointments.repository';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { Appointment } from '../entities/appointment.entity';
import { AvailabilityPort } from '../availability/availability.port';
import { PetsLookup } from '../clients/pets.lookup';
import { RemindersClient } from '../clients/reminders.client';
import { GetCitasQueryDto } from '../dto/get-citas-query.dto';
import { CreateCitaDto } from '../dto/create-cita.dto';
import { FinalStatus } from '../dto/update-estado.dto';

/** Estados en los que una cita ocupa el horario del veterinario. */
export const ACTIVE_STATUSES = ['booked', 'confirmed'] as const;

const UNIQUE_VIOLATION = '23505';

/**
 * [C3] Logica de negocio de GET /v1/citas: el dueño solo puede ver sus
 * propias citas (BR-8), asi que el clientId siempre sale del JWT
 * (request.user), nunca de un parametro que el cliente pueda manipular.
 *
 * [G2] Reserva de citas (BR-5): la doble reserva se evita con un bloqueo
 * por veterinario dentro de la transaccion, una consulta de solapamiento de
 * rangos (cubre bloques de distinta duracion) y, como ultima defensa, el
 * indice unico parcial uq_appointments_vet_start_active.
 */
@Injectable()
export class AppointmentsService {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly auditLog: AuditLogRepository,
    private readonly dataSource: DataSource,
    private readonly petsLookup: PetsLookup,
    private readonly reminders: RemindersClient,
    private readonly availability: AvailabilityPort,
  ) {}

  async findMyCitas(clientId: string | undefined, query: GetCitasQueryDto) {
    if (!clientId) {
      throw new ForbiddenException('El usuario no tiene un client_id asociado (BR-8).');
    }

    const { status, page, limit } = query;
    const [items, total] = await this.appointmentsRepository.findByClient(clientId, {
      status,
      page,
      limit,
    });

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 0,
      },
    };
  }

  /** POST /v1/citas: reserva una hora para una mascota (FR-3, BR-5, BR-8). */
  async create(user: JwtPayload, dto: CreateCitaDto): Promise<Appointment> {
    const startTime = new Date(dto.startTime);
    if (startTime.getTime() <= Date.now()) {
      throw new BadRequestException('No se puede reservar una hora que ya pasó.');
    }

    const pet = await this.petsLookup.findById(dto.petId);
    if (!pet || !pet.active) {
      throw new NotFoundException('La mascota indicada no existe.');
    }
    if (user.role === 'owner' && pet.clientId !== user.clientId) {
      throw new ForbiddenException('La mascota no pertenece a tu cuenta (BR-8).');
    }

    const block = await this.availability.findBlock(dto.vetUserId, dto.specialtyId, startTime);
    if (!block) {
      throw new NotFoundException('El veterinario no tiene un bloque disponible a esa hora.');
    }

    let appointment: Appointment;
    try {
      appointment = await this.dataSource.transaction(async (manager) => {
        // Serializa las reservas de un mismo veterinario: la segunda espera a que la
        // primera confirme y recien entonces revisa el solapamiento.
        await manager.query('SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))', [
          `appointments:${dto.vetUserId}`,
        ]);

        const repo = manager.getRepository(Appointment);
        const overlaps = await repo
          .createQueryBuilder('a')
          .where('a.vetUserId = :vetUserId', { vetUserId: dto.vetUserId })
          .andWhere('a.status IN (:...active)', { active: ACTIVE_STATUSES })
          .andWhere('a.startTime < :endTime AND a.endTime > :startTime', {
            startTime: block.startTime,
            endTime: block.endTime,
          })
          .getExists();
        if (overlaps) {
          throw new ConflictException('Horario ya reservado');
        }

        const saved = await repo.save(
          repo.create({
            slotId: block.slotId,
            petId: pet.id,
            clientId: pet.clientId,
            vetUserId: dto.vetUserId,
            specialtyId: dto.specialtyId,
            startTime: block.startTime,
            endTime: block.endTime,
            status: 'booked',
            channel: user.role === 'owner' ? 'app' : 'web',
            createdBy: user.sub,
            cancelledAt: null,
          }),
        );

        await this.auditLog.record(
          {
            actorUserId: user.sub,
            action: 'appointment.created',
            entityId: saved.id,
            data: {
              petId: saved.petId,
              vetUserId: saved.vetUserId,
              specialtyId: saved.specialtyId,
              startTime: saved.startTime,
            },
          },
          manager,
        );
        return saved;
      });
    } catch (error) {
      if (error instanceof QueryFailedError && (error as any).driverError?.code === UNIQUE_VIOLATION) {
        throw new ConflictException('Horario ya reservado');
      }
      throw error;
    }

    // La cita ya esta confirmada: si el aviso falla no se revierte (queda registrado).
    await this.reminders.schedule({
      appointmentId: appointment.id,
      ownerUserId: pet.ownerUserId,
      petName: pet.name,
      startsAt: appointment.startTime,
    });

    return appointment;
  }

  /**
   * PATCH /v1/citas/:id/cancelar: el dueño cancela solo sus citas futuras (BR-8);
   * recepcion y admin pueden cancelar cualquiera. Libera el horario porque el
   * indice unico solo considera citas booked/confirmed.
   */
  async cancel(user: JwtPayload, id: string): Promise<Appointment> {
    const appointment = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Appointment);
      const current = await repo.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!current) {
        throw new NotFoundException('La cita no existe.');
      }
      if (user.role === 'owner') {
        if (current.clientId !== user.clientId) {
          throw new ForbiddenException('La cita no pertenece a tu cuenta (BR-8).');
        }
        if (current.startTime.getTime() <= Date.now()) {
          throw new BadRequestException('No se puede cancelar una cita que ya comenzó.');
        }
      }
      if (!this.isActive(current.status)) {
        throw new ConflictException('La cita ya no se puede cancelar.');
      }

      const from = current.status;
      current.status = 'cancelled';
      current.cancelledAt = new Date();
      const saved = await repo.save(current);

      await this.auditLog.record(
        {
          actorUserId: user.sub,
          action: 'appointment.cancelled',
          entityId: saved.id,
          data: { from },
        },
        manager,
      );
      return saved;
    });

    // La cita ya esta cancelada: si no se puede anular el aviso solo se registra.
    await this.reminders.cancel(appointment.id);

    return appointment;
  }

  /**
   * PATCH /v1/citas/:id/estado: el personal cierra la cita como atendida o
   * inasistente. Un veterinario solo puede cerrar sus propias citas.
   */
  async updateStatus(user: JwtPayload, id: string, status: FinalStatus): Promise<Appointment> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Appointment);
      const current = await repo.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!current) {
        throw new NotFoundException('La cita no existe.');
      }
      if (user.role === 'vet' && current.vetUserId !== user.sub) {
        throw new ForbiddenException('Solo puedes actualizar tus propias citas.');
      }
      if (!this.isActive(current.status)) {
        throw new ConflictException(`No se puede pasar de "${current.status}" a "${status}".`);
      }

      const from = current.status;
      current.status = status;
      const saved = await repo.save(current);

      await this.auditLog.record(
        {
          actorUserId: user.sub,
          action: 'appointment.status_changed',
          entityId: saved.id,
          data: { from, to: status },
        },
        manager,
      );
      return saved;
    });
  }

  private isActive(status: string): boolean {
    return (ACTIVE_STATUSES as readonly string[]).includes(status);
  }
}
