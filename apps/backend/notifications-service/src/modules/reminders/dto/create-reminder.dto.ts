import { IsISO8601, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * [H1] Datos que envía scheduling-service al reservar una cita
 * (POST /internal/reminders).
 */
export class CreateReminderDto {
  /** Id de la cita en scheduling.appointments */
  @IsUUID()
  appointmentId!: string;

  /** Id del usuario dueño (auth.users) que recibirá el aviso. */
  @IsUUID()
  ownerUserId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  petName!: string;

  /** Inicio de la cita en ISO 8601, ej. 2026-10-25T15:00:00Z. */
  @IsISO8601()
  startsAt!: string;
}