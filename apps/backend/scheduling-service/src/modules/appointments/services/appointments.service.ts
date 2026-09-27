import { ForbiddenException, Injectable } from '@nestjs/common';
import { AppointmentsRepository } from '../repositories/appointments.repository';
import { GetCitasQueryDto } from '../dto/get-citas-query.dto';

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

    const { estado, page, limit } = query;
    const [items, total] = await this.appointmentsRepository.findByClient(clientId, {
      estado,
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
}
