import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { AppointmentsClient, AppointmentRange } from '../clients/appointments.client';
import { PetsLookup } from '../clients/pets.lookup';
import { VetsLookup } from '../clients/vets.lookup';
import { HistoryQueryDto } from '../dto/history-query.dto';
import { HistoryEventDto, HistoryResponseDto } from '../dto/history-response.dto';
import { ClinicalEvent } from '../entities/clinical-event.entity';
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
    private readonly pets: PetsLookup,
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

    const vetIds = [...new Set(events.map((event) => event.vetUserId))];
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
   * La pertenencia se consulta a clients-pets, porque la mascota no vive en este esquema.
   */
  private async assertCanView(user: JwtPayload, petId: string): Promise<void> {
    if (user.role !== 'owner') return;

    if (!user.clientId) {
      throw new ForbiddenException('El usuario autenticado no tiene un cliente asociado.');
    }

    const pet = await this.pets.findById(petId);
    if (!pet) {
      throw new NotFoundException(`Mascota con ID ${petId} no encontrada`);
    }
    if (pet.clientId !== user.clientId) {
      throw new ForbiddenException('No puedes consultar el historial de una mascota que no es tuya (BR-8).');
    }
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

  private toEventDto(event: ClinicalEvent, vetNames: Map<string, string | null>): HistoryEventDto {
    return {
      id: event.id,
      type: event.type,
      date: event.date,
      weightKg: event.weightKg,
      temperatureC: event.temperatureC,
      reason: event.reason,
      notes: event.notes,
      nextCheckup: event.nextCheckup,
      vaccination: event.vaccination
        ? {
            vaccine: event.vaccination.vaccine,
            laboratory: event.vaccination.laboratory,
            batch: event.vaccination.batch,
            boosterDate: event.vaccination.boosterDate,
          }
        : null,
      vet: { id: event.vetUserId, name: vetNames.get(event.vetUserId) ?? null },
    };
  }
}
