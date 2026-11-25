import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { Rating } from '../entities/rating.entity';

/** Filtros de las consultas de calificaciones; `toExclusive` deja el extremo superior abierto. */
export interface RatingFilters {
  vetUserId?: string;
  from?: Date;
  toExclusive?: Date;
}

/** Una calificación junto con los datos de su cita que el personal necesita ver. */
export interface RatingRow {
  id: string;
  appointmentId: string;
  stars: number;
  comment: string | null;
  createdAt: Date;
  vetUserId: string;
  appointmentStartTime: Date;
}

export interface StarsCount {
  stars: number;
  count: number;
}

/**
 * [A3][K2] Repositorio tipado de scheduling.ratings (BR-13). Las consultas de
 * listado y resumen unen cada calificación con su cita para filtrar por veterinario.
 */
@Injectable()
export class RatingsRepository {
  constructor(
    @InjectRepository(Rating)
    private readonly repo: Repository<Rating>,
  ) {}

  findByAppointmentId(appointmentId: string): Promise<Rating | null> {
    return this.repo.findOne({ where: { appointmentId } });
  }

  create(data: Pick<Rating, 'appointmentId' | 'clientId' | 'stars' | 'comment'>): Promise<Rating> {
    return this.repo.save(this.repo.create(data));
  }

  /** Calificaciones más recientes primero (empate por id, para que la paginación sea estable). */
  async findPage(
    filters: RatingFilters,
    page: number,
    limit: number,
  ): Promise<[RatingRow[], number]> {
    const qb = this.filtered(filters);
    const total = await qb.getCount();

    const rows = await qb
      .select('r.id', 'id')
      .addSelect('r.appointmentId', 'appointmentId')
      .addSelect('r.stars', 'stars')
      .addSelect('r.comment', 'comment')
      .addSelect('r.createdAt', 'createdAt')
      .addSelect('a.vetUserId', 'vetUserId')
      .addSelect('a.startTime', 'appointmentStartTime')
      .orderBy('r.createdAt', 'DESC')
      .addOrderBy('r.id', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany<RatingRow>();

    return [rows, total];
  }

  /** Cuántas calificaciones hay de cada cantidad de estrellas (solo las que existen). */
  async countByStars(filters: RatingFilters): Promise<StarsCount[]> {
    const rows = await this.filtered(filters)
      .select('r.stars', 'stars')
      .addSelect('COUNT(*)', 'count')
      .groupBy('r.stars')
      .getRawMany<{ stars: number | string; count: string }>();

    return rows.map((row) => ({ stars: Number(row.stars), count: Number(row.count) }));
  }

  private filtered(filters: RatingFilters): SelectQueryBuilder<Rating> {
    const qb = this.repo
      .createQueryBuilder('r')
      .innerJoin(Appointment, 'a', 'a.id = r.appointmentId')
      .where('r.stars IS NOT NULL');

    if (filters.vetUserId) {
      qb.andWhere('a.vetUserId = :vetUserId', { vetUserId: filters.vetUserId });
    }
    if (filters.from) {
      qb.andWhere('r.createdAt >= :from', { from: filters.from });
    }
    if (filters.toExclusive) {
      qb.andWhere('r.createdAt < :toExclusive', { toExclusive: filters.toExclusive });
    }
    return qb;
  }
}
