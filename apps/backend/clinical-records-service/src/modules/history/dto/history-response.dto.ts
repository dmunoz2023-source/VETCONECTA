import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CLINICAL_EVENT_TYPES, ClinicalEventType } from '../entities/clinical-event.entity';

export class VetSummaryDto {
  @ApiProperty({ format: 'uuid', description: 'Id del usuario veterinario.' })
  id: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Nombre del veterinario. Es null si el servicio de catálogo no respondió.',
  })
  name: string | null;
}

export class VaccinationDto {
  @ApiPropertyOptional({ type: String, nullable: true, example: 'Rabia' })
  vaccine: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  laboratory: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  batch: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: '2027-10-15', description: 'Fecha del refuerzo.' })
  boosterDate: string | null;
}

export class HistoryEventDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: CLINICAL_EVENT_TYPES })
  type: ClinicalEventType;

  @ApiProperty({ type: String, format: 'date-time' })
  date: Date;

  @ApiPropertyOptional({ type: Number, nullable: true, example: 12.5 })
  weightKg: number | null;

  @ApiPropertyOptional({ type: Number, nullable: true, example: 38.5 })
  temperatureC: number | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  reason: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  notes: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: '2027-01-10', description: 'Fecha del próximo control.' })
  nextCheckup: string | null;

  @ApiPropertyOptional({ type: VaccinationDto, nullable: true, description: 'Solo en eventos de tipo vaccine.' })
  vaccination: VaccinationDto | null;

  @ApiProperty({ type: VetSummaryDto })
  vet: VetSummaryDto;
}

export class HistoryAppointmentDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ type: String, format: 'date-time' })
  startTime: string;

  @ApiProperty({ type: String, format: 'date-time' })
  endTime: string;

  @ApiProperty({
    enum: ['booked', 'confirmed', 'completed', 'cancelled', 'no_show'],
    description: 'Estado de la cita.',
  })
  status: string;

  @ApiProperty({ format: 'uuid' })
  vetUserId: string;

  @ApiProperty({ format: 'uuid' })
  specialtyId: string;
}

export class PageMetaDto {
  @ApiProperty({ example: 25, description: 'Total de eventos clínicos que cumplen los filtros.' })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class HistoryResponseDto {
  @ApiProperty({
    type: [HistoryEventDto],
    description: 'Eventos clínicos del más reciente al más antiguo (paginados).',
  })
  data: HistoryEventDto[];

  @ApiProperty({ type: PageMetaDto })
  meta: PageMetaDto;

  @ApiProperty({
    type: [HistoryAppointmentDto],
    description:
      'Citas pasadas de la mascota (de la más reciente a la más antigua) dentro del mismo rango de ' +
      'fechas, con su estado. No se paginan: la paginación aplica a los eventos clínicos.',
  })
  appointments: HistoryAppointmentDto[];

  @ApiProperty({
    description:
      'false si el servicio de citas no respondió: en ese caso `appointments` viene vacío y no ' +
      'significa que la mascota no tenga citas pasadas.',
  })
  appointmentsAvailable: boolean;
}
