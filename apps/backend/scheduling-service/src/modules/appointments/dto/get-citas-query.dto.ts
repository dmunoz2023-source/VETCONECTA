import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

const VALID_STATUSES: AppointmentStatus[] = [
  'booked',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
];

/**
 * [C3] Query params de GET /v1/citas.
 *
 * `status` llega como string separado por comas (ej. "booked,confirmed")
 * porque es la forma mas simple de mandar un filtro de arreglo por query string;
 * se transforma a string[] antes de validar cada valor contra AppointmentStatus.
 */
export class GetCitasQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((v) => v.trim()) : value,
  )
  @IsArray()
  @IsIn(VALID_STATUSES, { each: true })
  status?: AppointmentStatus[];

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}
