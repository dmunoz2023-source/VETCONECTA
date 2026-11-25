import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, Matches } from 'class-validator';

/**
 * Cualquier UUID en forma 8-4-4-4-12. No se usa @IsUUID porque exige version y
 * variante RFC 4122 y rechazaria los ids del seed (55555555-5555-5555-...),
 * que PostgreSQL si acepta en columnas uuid.
 */
const UUID_FORMAT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * [G2] Cuerpo de POST /v1/scheduling/appointments. `startTime` debe incluir zona horaria
 * (ej. 2026-11-02T15:00:00-03:00) para evitar ambiguedades de hora local.
 */
export class CreateCitaDto {
  @ApiProperty({ example: '3b7a6c1e-0d2f-4a8b-9c3d-5e6f7a8b9c0d', description: 'Mascota. Un dueño solo puede reservar para las suyas (BR-8).' })
  @Matches(UUID_FORMAT, { message: 'petId debe ser un UUID valido' })
  petId!: string;

  @ApiProperty({ example: '55555555-5555-5555-5555-555555555551', description: 'Id de usuario del veterinario (auth-service).' })
  @Matches(UUID_FORMAT, { message: 'vetUserId debe ser un UUID valido' })
  vetUserId!: string;

  @ApiProperty({ example: '44444444-4444-4444-4444-444444444441', description: 'Especialidad que atiende el veterinario (BR-4).' })
  @Matches(UUID_FORMAT, { message: 'specialtyId debe ser un UUID valido' })
  specialtyId!: string;

  @ApiProperty({ example: '2026-11-02T15:00:00-03:00', description: 'Inicio del bloque, ISO 8601 con zona horaria.' })
  @IsISO8601({ strict: true }, { message: 'startTime debe ser una fecha y hora ISO 8601' })
  @Matches(/(Z|[+-]\d{2}:\d{2})$/, {
    message: 'startTime debe incluir la zona horaria (ej. 2026-11-02T15:00:00-03:00)',
  })
  startTime!: string;
}
