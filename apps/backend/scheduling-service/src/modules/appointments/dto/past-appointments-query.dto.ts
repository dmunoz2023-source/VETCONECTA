import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsUUID } from 'class-validator';

/**
 * [F3] Query params de GET /internal/appointments: las citas pasadas de una
 * mascota, que clinical-records-service une al historial clínico.
 *
 * `from` es inclusivo y `to` es exclusivo, ambos instantes ISO 8601 con zona
 * horaria; sin ellos se devuelven todas las citas pasadas.
 */
export class PastAppointmentsQueryDto {
  @ApiProperty({ format: 'uuid', description: 'Mascota cuyas citas pasadas se piden.' })
  @IsUUID('all', { message: 'petId debe ser un UUID válido' })
  petId!: string;

  @ApiPropertyOptional({ description: 'Inicio del rango (inclusivo), ISO 8601.' })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'from debe ser una fecha y hora ISO 8601' })
  from?: string;

  @ApiPropertyOptional({ description: 'Fin del rango (exclusivo), ISO 8601.' })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'to debe ser una fecha y hora ISO 8601' })
  to?: string;
}
