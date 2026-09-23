import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentEstado } from '../entities/appointment.entity';

export interface FindByClientOptions {
  estado?: AppointmentEstado[];
  page: number;
  limit: number;
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

  async findByClient(
    clientId: string,
    { estado, page, limit }: FindByClientOptions,
  ): Promise<[Appointment[], number]> {
    const qb = this.repo
      .createQueryBuilder('appointment')
      .where('appointment.client_id = :clientId', { clientId })
      .orderBy('appointment.inicio', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (estado && estado.length > 0) {
      qb.andWhere('appointment.estado IN (:...estado)', { estado });
    }

    return qb.getManyAndCount();
  }
}
