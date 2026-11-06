import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AppointmentsRepository } from '../../appointments/repositories/appointments.repository';
import { CatalogClient } from '../../schedules/clients/catalog.client';
import { VetBlocksRepository } from '../../schedules/repositories/vet-blocks.repository';
import { DayBlocksService } from '../../schedules/services/day-blocks.service';
import { clinicTimeToDate, formatClinicDateTime, nextDate } from '../../schedules/utils/clinic-time';
import { vetBlockRange } from '../../schedules/utils/vet-block-range';
import { AvailabilityBlockDto } from '../dto/availability-block.dto';
import { GetAvailabilityQueryDto } from '../dto/get-availability-query.dto';

const MAX_RANGE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

interface Range {
  startTime: Date;
  endTime: Date;
}

const overlaps = (a: Range, b: Range): boolean =>
  a.startTime < b.endTime && b.startTime < a.endTime;

/**
 * [G1] Bloques libres (FR-3, FR-7): horario del veterinario dividido según la
 * especialidad, menos citas vigentes, bloqueos y horas pasadas. Se calcula en
 * cada consulta, así que un cambio de horario se refleja de inmediato.
 */
@Injectable()
export class AvailabilityService {
  constructor(
    private readonly catalog: CatalogClient,
    private readonly dayBlocks: DayBlocksService,
    private readonly appointments: AppointmentsRepository,
    private readonly vetBlocks: VetBlocksRepository,
  ) {}

  async findFreeBlocks(query: GetAvailabilityQueryDto): Promise<AvailabilityBlockDto[]> {
    const { specialtyId, vetId, from, to } = query;
    this.assertValidRange(from, to);
    const durationMinutes = await this.findDuration(vetId, specialtyId);

    const [candidates, appointments, blocks] = await Promise.all([
      this.dayBlocks.generateRange(vetId, from, to, durationMinutes),
      this.appointments.findActiveByVetBetween(
        vetId,
        clinicTimeToDate(from, '00:00'),
        clinicTimeToDate(nextDate(to), '00:00'),
      ),
      this.vetBlocks.findByVet(vetId, from, to),
    ]);

    const busy: Range[] = [
      ...appointments,
      ...blocks.map(vetBlockRange).map(({ from: startTime, to: endTime }) => ({ startTime, endTime })),
    ];
    const now = new Date();

    return candidates
      .filter((block) => block.startTime > now && !busy.some((range) => overlaps(block, range)))
      .map(({ startTime, endTime }) => ({
        startTime: formatClinicDateTime(startTime),
        endTime: formatClinicDateTime(endTime),
      }));
  }

  private assertValidRange(from: string, to: string): void {
    const days = (Date.parse(to) - Date.parse(from)) / DAY_MS + 1;
    if (days < 1) {
      throw new BadRequestException('La fecha `to` no puede ser anterior a `from`.');
    }
    if (days > MAX_RANGE_DAYS) {
      throw new BadRequestException(`El rango no puede superar los ${MAX_RANGE_DAYS} días.`);
    }
  }

  /** El veterinario debe estar activo y atender la especialidad (BR-4). */
  private async findDuration(vetId: string, specialtyId: string): Promise<number> {
    const vet = await this.catalog.findVet(vetId);
    if (!vet) {
      throw new NotFoundException(`Veterinario ${vetId} no encontrado.`);
    }
    const specialty = vet.specialties.find(({ id }) => id === specialtyId);
    if (!vet.active || !specialty) {
      throw new UnprocessableEntityException(
        'El veterinario no está disponible para esta especialidad.',
      );
    }
    return specialty.durationMinutes;
  }
}
