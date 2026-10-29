import { IsISO8601, Matches } from 'class-validator';

/**
 * Cualquier UUID en forma 8-4-4-4-12. No se usa @IsUUID porque exige version y
 * variante RFC 4122 y rechazaria los ids del seed (55555555-5555-5555-...),
 * que PostgreSQL si acepta en columnas uuid.
 */
const UUID_FORMAT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * [G2] Cuerpo de POST /v1/citas. `startTime` debe incluir zona horaria
 * (ej. 2026-11-02T15:00:00-03:00) para evitar ambiguedades de hora local.
 */
export class CreateCitaDto {
  @Matches(UUID_FORMAT, { message: 'petId debe ser un UUID valido' })
  petId!: string;

  @Matches(UUID_FORMAT, { message: 'vetUserId debe ser un UUID valido' })
  vetUserId!: string;

  @Matches(UUID_FORMAT, { message: 'specialtyId debe ser un UUID valido' })
  specialtyId!: string;

  @IsISO8601({ strict: true }, { message: 'startTime debe ser una fecha y hora ISO 8601' })
  @Matches(/(Z|[+-]\d{2}:\d{2})$/, {
    message: 'startTime debe incluir la zona horaria (ej. 2026-11-02T15:00:00-03:00)',
  })
  startTime!: string;
}
