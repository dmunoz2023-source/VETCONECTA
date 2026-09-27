import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { AppointmentEstado } from '../entities/appointment.entity';

const ESTADOS_VALIDOS: AppointmentEstado[] = [
  'reservada',
  'confirmada',
  'realizada',
  'cancelada',
  'no_asistio',
];

/**
 * [C3] Query params de GET /v1/citas.
 *
 * `estado` llega como string separado por comas (ej. "reservada,confirmada")
 * porque es la forma mas simple de mandar un filtro de arreglo por query string;
 * se transforma a string[] antes de validar cada valor contra AppointmentEstado.
 */
export class GetCitasQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((v) => v.trim()) : value,
  )
  @IsArray()
  @IsIn(ESTADOS_VALIDOS, { each: true })
  estado?: AppointmentEstado[];

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
