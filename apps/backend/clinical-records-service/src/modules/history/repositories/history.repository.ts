import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicalEvent, ClinicalEventType } from '../entities/clinical-event.entity';

export interface EventFilters {
  petId: string;
  type?: ClinicalEventType;
  /** Inicio del rango (inclusive). */
  from?: Date;
  /** Fin del rango (exclusivo): el servicio ya convirtió "fecha sola" en el día siguiente. */
  toExclusive?: Date;
  page: number;
  limit: number;
}

@Injectable()
export class HistoryRepository {
  constructor(
    @InjectRepository(ClinicalEvent)
    private readonly events: Repository<ClinicalEvent>,
  ) {}

  /**
   * Eventos clínicos de una mascota, del más reciente al más antiguo, con el detalle
   * de vacuna (LEFT JOIN, 1 a 1 por UNIQUE: no duplica filas). El filtro por mascota y
   * el orden por fecha usan idx_clinical_events_pet_date (pet_id, date DESC).
   *
   * Se usa limit/offset (y no skip/take) porque no hay JOIN uno-a-muchos: así la página
   * sale en una sola consulta en vez de la estrategia de dos pasos de TypeORM.
   */
  async findPage(filters: EventFilters): Promise<{ events: ClinicalEvent[]; total: number }> {
    const query = this.events
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.vaccination', 'vaccination')
      .where('event.petId = :petId', { petId: filters.petId });

    if (filters.type) query.andWhere('event.type = :type', { type: filters.type });
    if (filters.from) query.andWhere('event.date >= :from', { from: filters.from });
    if (filters.toExclusive) query.andWhere('event.date < :to', { to: filters.toExclusive });

    const total = await query.getCount();

    const events = await query
      .orderBy('event.date', 'DESC')
      .addOrderBy('event.id', 'DESC')
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit)
      .getMany();

    return { events, total };
  }
}
