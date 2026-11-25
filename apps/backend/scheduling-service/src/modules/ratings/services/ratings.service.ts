import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import {
  AccessDeniedException,
  BusinessRuleException,
  ResourceNotFoundException,
} from '@app/shared/exceptions/domain.exceptions';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { AppointmentsRepository } from '../../appointments/repositories/appointments.repository';
import { RatingFilters, RatingsRepository } from '../../appointments/repositories/ratings.repository';
import { PetOwnerCheck } from '../clients/pet-owner.check';
import { CreateRatingDto } from '../dto/create-rating.dto';
import { GetRatingsQueryDto, RatingsFilterDto } from '../dto/get-ratings-query.dto';
import { RatingAlreadyExistsException } from '../exceptions/rating-already-exists.exception';

const UNIQUE_VIOLATION = '23505';
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface RatingSummary {
  /** Promedio de estrellas con 2 decimales; null si todavía no hay calificaciones. */
  average: number | null;
  total: number;
  /** Cantidad de calificaciones por número de estrellas (1 a 5). */
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
}

/**
 * [K2] Calificaciones de las citas (FR-12, BR-13): el dueño califica una sola vez cada
 * cita realizada y el personal consulta el listado y el resumen (promedio y distribución).
 */
@Injectable()
export class RatingsService {
  constructor(
    private readonly appointments: AppointmentsRepository,
    private readonly ratings: RatingsRepository,
    private readonly petOwner: PetOwnerCheck,
  ) {}

  /**
   * POST /v1/scheduling/appointments/:id/rating. Orden de las validaciones:
   * la cita existe (404), es del dueño (403), está realizada (422) y no tiene calificación (409).
   */
  async create(user: JwtPayload, appointmentId: string, dto: CreateRatingDto) {
    const appointment = await this.appointments.findById(appointmentId);
    if (!appointment) {
      throw new ResourceNotFoundException('La cita no existe.');
    }

    // El JWT todavía no trae clientId: la pertenencia se pregunta a clients-pets con el sub.
    if (!(await this.petOwner.isOwner(appointment.petId, user.sub))) {
      throw new AccessDeniedException('La cita no pertenece a tu cuenta (BR-8).');
    }

    if (appointment.status !== 'completed') {
      throw new BusinessRuleException(
        'Solo se puede calificar una cita realizada.',
        'APPOINTMENT_NOT_COMPLETED',
      );
    }

    if (await this.ratings.findByAppointmentId(appointment.id)) {
      throw new RatingAlreadyExistsException();
    }

    try {
      const saved = await this.ratings.create({
        appointmentId: appointment.id,
        clientId: appointment.clientId,
        stars: dto.stars,
        comment: dto.comment ?? null,
      });
      return {
        id: saved.id,
        appointmentId: saved.appointmentId,
        stars: saved.stars,
        comment: saved.comment,
        createdAt: saved.createdAt,
      };
    } catch (error) {
      // Dos peticiones simultáneas: gana la primera y la segunda choca con appointment_id UNIQUE.
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string } | undefined)?.code === UNIQUE_VIOLATION
      ) {
        throw new RatingAlreadyExistsException();
      }
      throw error;
    }
  }

  /** GET /v1/scheduling/ratings: listado paginado, de la calificación más reciente a la más antigua. */
  async findAll(query: GetRatingsQueryDto) {
    const { page, limit } = query;
    const [items, total] = await this.ratings.findPage(this.toFilters(query), page, limit);

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 0 },
    };
  }

  /** GET /v1/scheduling/ratings/summary: promedio y distribución de 1 a 5 estrellas. */
  async summarize(query: RatingsFilterDto): Promise<RatingSummary> {
    const counts = await this.ratings.countByStars(this.toFilters(query));

    const distribution: RatingSummary['distribution'] = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    let total = 0;
    let sum = 0;
    for (const { stars, count } of counts) {
      distribution[String(stars) as keyof RatingSummary['distribution']] = count;
      total += count;
      sum += stars * count;
    }

    return {
      average: total === 0 ? null : Math.round((sum / total) * 100) / 100,
      total,
      distribution,
    };
  }

  /**
   * Convierte los filtros del query: `to` es inclusivo, así que se vuelve un límite
   * superior abierto. Con fecha sin hora (2026-11-30) incluye todo ese día.
   */
  private toFilters({ vetUserId, from, to }: RatingsFilterDto): RatingFilters {
    const fromDate = from ? new Date(from) : undefined;
    let toExclusive: Date | undefined;
    if (to) {
      const toDate = new Date(to);
      toExclusive = new Date(toDate.getTime() + (DATE_ONLY.test(to) ? DAY_MS : 1));
    }

    if (
      (fromDate && Number.isNaN(fromDate.getTime())) ||
      (toExclusive && Number.isNaN(toExclusive.getTime()))
    ) {
      throw new BadRequestException('from y to deben ser fechas ISO 8601 válidas.');
    }
    if (fromDate && toExclusive && fromDate.getTime() >= toExclusive.getTime()) {
      throw new BadRequestException('from no puede ser posterior a to.');
    }

    return { vetUserId, from: fromDate, toExclusive };
  }
}
