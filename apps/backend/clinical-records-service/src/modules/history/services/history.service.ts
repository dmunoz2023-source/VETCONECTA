import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { ClientsPetsClient } from '../../clinical/clients/clients-pets.client';
import { ClinicalEventEntity } from '../../clinical/entities/clinical-event.entity';
import { AppointmentsClient, AppointmentRange } from '../clients/appointments.client';
import { VetsLookup } from '../clients/vets.lookup';
import { HistoryQueryDto } from '../dto/history-query.dto';
import { HistoryEventDto, HistoryResponseDto } from '../dto/history-response.dto';
import { ClinicalEventType } from '../clinical-event-types';
import { HistoryRepository } from '../repositories/history.repository';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * [F3] Historial clínico consolidado de una mascota (FR-8): eventos clínicos del más
 * reciente al más antiguo con los datos del veterinario, más sus citas pasadas con su estado.
 */
@Injectable()
export class HistoryService {
  constructor(
    private readonly history: HistoryRepository,
    private readonly clientsPets: ClientsPetsClient,
    private readonly vets: VetsLookup,
    private readonly appointments: AppointmentsClient,
  ) {}

  async getHistory(user: JwtPayload, petId: string, query: HistoryQueryDto): Promise<HistoryResponseDto> {
    const range = this.resolveRange(query);
    await this.assertCanView(user, petId);

    const { events, total } = await this.history.findPage({
      petId,
      type: query.type,
      from: range.from,
      toExclusive: range.toExclusive,
      page: query.page,
      limit: query.limit,
    });

    const vetIds = [...new Set(events.map((event) => event.veterinarianId))];
    const [vetNames, pastAppointments] = await Promise.all([
      this.vets.findNames(vetIds),
      this.appointments.findPastByPet(petId, range),
    ]);

    return {
      data: events.map((event) => this.toEventDto(event, vetNames)),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
      appointments: pastAppointments ?? [],
      appointmentsAvailable: pastAppointments !== null,
    };
  }

  /**
   * BR-8 y NFR-4: el personal clínico ve cualquier mascota; el dueño solo las suyas (403).
   * La pertenencia se consulta a clients-pets con el id de usuario del token (`sub`), porque
   * la mascota no vive en este esquema y el token no trae `clientId`. Si la mascota no es del
   * dueño o no existe, clients-pets responde 404 y aquí sale 403, sin revelar si existe.
   */
  private async assertCanView(user: JwtPayload, petId: string): Promise<void> {
    if (user.role !== 'owner') return;
    await this.clientsPets.assertPetOwnership(petId, user.sub);
  }

  /** Las fechas sin hora se interpretan en UTC; un `to` sin hora incluye el día completo. */
  private resolveRange(query: HistoryQueryDto): AppointmentRange {
    const from = query.from ? new Date(query.from) : undefined;
    let toExclusive: Date | undefined;
    if (query.to) {
      const to = new Date(query.to);
      toExclusive = new Date(to.getTime() + (DATE_ONLY.test(query.to) ? DAY_MS : 1));
    }

    if (from && toExclusive && from >= toExclusive) {
      throw new BadRequestException('El rango de fechas es inválido: from debe ser anterior o igual a to.');
    }
    return { from, toExclusive };
  }

  private toEventDto(event: ClinicalEventEntity, vetNames: Map<string, string | null>): HistoryEventDto {
    return {
      id: event.id,
      type: event.type as ClinicalEventType,
      date: event.date,
      weightKg: this.toNumber(event.weightKg),
      temperatureC: this.toNumber(event.temperatureC),
      reason: event.reason,
      notes: event.notes,
      nextCheckup: event.nextCheckup,
      vaccination: event.vaccinationDetails
        ? {
            vaccine: event.vaccinationDetails.vaccine,
            laboratory: event.vaccinationDetails.laboratory,
            batch: event.vaccinationDetails.batch,
            boosterDate: event.vaccinationDetails.boosterDate,
          }
        : null,
      vet: { id: event.veterinarianId, name: vetNames.get(event.veterinarianId) ?? null },
    };
  }

  /** Las columnas DECIMAL llegan de pg como texto; se exponen como número (o null). */
  private toNumber(value: number | string | null): number | null {
    return value === null || value === undefined ? null : Number(value);
  }
}
