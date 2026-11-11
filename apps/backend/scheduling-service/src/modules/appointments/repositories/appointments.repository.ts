import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, MoreThan, Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';

export interface FindByClientOptions {
  status?: AppointmentStatus[];
  page: number;
  limit: number;
}

export interface FindPastByPetOptions {
  /** Inicio del rango (inclusivo). */
  from?: Date;
  /** Fin del rango (exclusivo). */
  toExclusive?: Date;
  /** Instante de referencia: solo cuentan las citas que empezaron antes. */
  now: Date;
}

/**
 * [A3] Repositorio tipado de scheduling.appointments. `findByClient` queda
 * listo para que la tarea C3 (GET /citas) lo use directamente: filtra por
 * client_id (UUID plano, sin relación a clients_pets) y por estado,
 * ordenado por fecha, con paginación.
 */
@Injectable()
export class AppointmentsRepository {
  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,
  ) {}

  findById(id: string): Promise<Appointment | null> {
    return this.repo.findOne({ where: { id }, relations: ['slot'] });
  }

  /** [G3] Citas vigentes del veterinario que se cruzan con el rango [from, to). */
  findActiveByVetBetween(vetUserId: string, from: Date, to: Date): Promise<Appointment[]> {
    return this.repo.find({
      where: {
        vetUserId,
        status: In(['booked', 'confirmed']),
        startTime: LessThan(to),
        endTime: MoreThan(from),
      },
      order: { startTime: 'ASC' },
    });
  }

  async findByClient(
    clientId: string,
    { status, page, limit }: FindByClientOptions,
  ): Promise<[Appointment[], number]> {
    const qb = this.repo
      .createQueryBuilder('appointment')
      .where('appointment.clientId = :clientId', { clientId })
      .orderBy('appointment.startTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status && status.length > 0) {
      qb.andWhere('appointment.status IN (:...status)', { status });
    }

    return qb.getManyAndCount();
  }

  /**
   * [F3] Citas pasadas de una mascota (inicio anterior a `now`), de la más reciente
   * a la más antigua y con cualquier estado. `from` es inclusivo y `toExclusive` exclusivo.
   */
  findPastByPet(petId: string, { from, toExclusive, now }: FindPastByPetOptions): Promise<Appointment[]> {
    const qb = this.repo
      .createQueryBuilder('appointment')
      .where('appointment.petId = :petId', { petId })
      .andWhere('appointment.startTime < :now', { now })
      .orderBy('appointment.startTime', 'DESC')
      .addOrderBy('appointment.id', 'DESC');

    if (from) {
      qb.andWhere('appointment.startTime >= :from', { from });
    }
    if (toExclusive) {
      qb.andWhere('appointment.startTime < :toExclusive', { toExclusive });
    }

    return qb.getMany();
  }
}
