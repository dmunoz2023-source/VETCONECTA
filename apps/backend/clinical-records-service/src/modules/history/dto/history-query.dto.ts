import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsISO8601, IsOptional, Max, Min } from 'class-validator';
import { CLINICAL_EVENT_TYPES, ClinicalEventType } from '../clinical-event-types';

/**
 * [F3] Query params de GET /v1/clinical/pets/:petId/history.
 *
 * `from` y `to` acotan tanto los eventos clínicos como las citas pasadas. Aceptan
 * una fecha (2026-10-01) o una fecha con hora (2026-10-01T15:00:00-03:00); una
 * fecha sola en `to` incluye el día completo.
 */
export class HistoryQueryDto {
  @ApiPropertyOptional({
    enum: CLINICAL_EVENT_TYPES,
    description: 'Filtra los eventos clínicos por tipo.',
    example: 'vaccine',
  })
  @IsOptional()
  @IsIn(CLINICAL_EVENT_TYPES, { message: 'type debe ser consultation, vaccine o checkup' })
  type?: ClinicalEventType;

  @ApiPropertyOptional({
    description: 'Inicio del rango (inclusive). Fecha o fecha con hora ISO 8601.',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'from debe ser una fecha ISO 8601' })
  from?: string;

  @ApiPropertyOptional({
    description: 'Fin del rango (inclusive). Fecha o fecha con hora ISO 8601.',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'to debe ser una fecha ISO 8601' })
  to?: string;

  @ApiPropertyOptional({
    type: Number,
    default: 1,
    minimum: 1,
    description: 'Número de página (paginación de los eventos clínicos).',
  })
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt({ message: 'page debe ser un entero' })
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    type: Number,
    default: 10,
    minimum: 1,
    maximum: 50,
    description: 'Cantidad de eventos por página (máximo 50).',
  })
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt({ message: 'limit debe ser un entero' })
  @Min(1)
  @Max(50)
  limit: number = 10;
}
