import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, MoreThan, Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { Rating } from '../entities/rating.entity';

/** [K2] Cita del listado del dueño, con la marca de si ya fue calificada. */
export type AppointmentWithRated = Appointment & { rated: boolean };

export interface FindByClientOptions {
  status?: AppointmentStatus[];
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
  ): Promise<[AppointmentWithRated[], number]> {
    const qb = this.repo
      .createQueryBuilder('appointment')
      .where('appointment.clientId = :clientId', { clientId })
      .orderBy('appointment.startTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status && status.length > 0) {
      qb.andWhere('appointment.status IN (:...status)', { status });
    }

    const [items, total] = await qb.getManyAndCount();
    return [await this.markRated(items), total];
  }

  /** [K2] Agrega `rated` (true si la cita ya tiene calificación) con una sola consulta por página. */
  private async markRated(items: Appointment[]): Promise<AppointmentWithRated[]> {
    if (items.length === 0) {
      return [];
    }
    const ratings = await this.repo.manager.getRepository(Rating).find({
      select: { appointmentId: true },
      where: { appointmentId: In(items.map((item) => item.id)) },
    });
    const rated = new Set(ratings.map((rating) => rating.appointmentId));
    return items.map((item) => Object.assign(item, { rated: rated.has(item.id) }));
  }
}
