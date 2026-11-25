import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, IsUUID, Max, Min } from 'class-validator';

/**
 * [K2] Filtros comunes de GET /v1/scheduling/ratings y /ratings/summary.
 * La fecha filtra por el día en que se registró la calificación.
 */
export class RatingsFilterDto {
  @ApiPropertyOptional({ format: 'uuid', description: 'Solo calificaciones de las citas de este veterinario.' })
  @IsOptional()
  @IsUUID('all')
  vetUserId?: string;

  @ApiPropertyOptional({
    example: '2026-11-01',
    description: 'Desde (inclusive). Fecha ISO 8601; sin hora se toma desde las 00:00 UTC.',
  })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-11-30',
    description: 'Hasta (inclusive). Fecha ISO 8601; sin hora incluye el día completo.',
  })
  @IsOptional()
  @IsISO8601()
  to?: string;
}

/** [K2] Query de GET /v1/scheduling/ratings: filtros y paginación. */
export class GetRatingsQueryDto extends RatingsFilterDto {
  @ApiPropertyOptional({ type: Number, default: 1, minimum: 1, description: 'Número de página.' })
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    type: Number,
    default: 10,
    minimum: 1,
    maximum: 50,
    description: 'Cantidad de resultados por página (máximo 50).',
  })
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}
