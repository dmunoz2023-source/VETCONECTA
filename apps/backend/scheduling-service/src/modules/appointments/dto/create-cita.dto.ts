import { IsISO8601, IsUUID, Matches } from 'class-validator';

/**
 * [G2] Cuerpo de POST /v1/citas. `startTime` debe incluir zona horaria
 * (ej. 2026-11-02T15:00:00-03:00) para evitar ambiguedades de hora local.
 */
export class CreateCitaDto {
  @IsUUID('all', { message: 'petId debe ser un UUID valido' })
  petId!: string;

  @IsUUID('all', { message: 'vetUserId debe ser un UUID valido' })
  vetUserId!: string;

  @IsUUID('all', { message: 'specialtyId debe ser un UUID valido' })
  specialtyId!: string;

  @IsISO8601({ strict: true }, { message: 'startTime debe ser una fecha y hora ISO 8601' })
  @Matches(/(Z|[+-]\d{2}:\d{2})$/, {
    message: 'startTime debe incluir la zona horaria (ej. 2026-11-02T15:00:00-03:00)',
  })
  startTime!: string;
}
