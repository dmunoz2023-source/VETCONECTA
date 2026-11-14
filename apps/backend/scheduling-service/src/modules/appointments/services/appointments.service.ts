import { ForbiddenException, Injectable } from '@nestjs/common';
import { AppointmentsRepository } from '../repositories/appointments.repository';
import { GetCitasQueryDto } from '../dto/get-citas-query.dto';
import { PastAppointmentsQueryDto } from '../dto/past-appointments-query.dto';

/**
 * [C3] Logica de negocio de GET /v1/citas: el dueño solo puede ver sus
 * propias citas (BR-8), asi que el clientId siempre sale del JWT
 * (request.user), nunca de un parametro que el cliente pueda manipular.
 */
@Injectable()
export class AppointmentsService {
  constructor(private readonly appointmentsRepository: AppointmentsRepository) {}

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

  /**
   * [F3] Citas pasadas de una mascota con su estado, para el historial clínico
   * (FR-8). Solo expone los campos que clinical necesita, no los datos internos.
   */
  async findPastByPet(query: PastAppointmentsQueryDto, now: Date = new Date()) {
    const appointments = await this.appointmentsRepository.findPastByPet(query.petId, {
      from: query.from ? new Date(query.from) : undefined,
      toExclusive: query.to ? new Date(query.to) : undefined,
      now,
    });

    return {
      data: appointments.map((appointment) => ({
        id: appointment.id,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        vetUserId: appointment.vetUserId,
        specialtyId: appointment.specialtyId,
      })),
    };
  }
}
