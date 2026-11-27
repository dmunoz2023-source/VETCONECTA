import { IsNotEmpty, IsString, Matches } from 'class-validator';

/** Cualquier UUID en forma 8-4-4-4-12 (ver create-reminder.dto.ts). */
const UUID_FORMAT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Parámetros de DELETE /internal/reminders?type=appointment&refId=<uuid>. */
export class CancelRemindersQueryDto {
  @IsString()
  @IsNotEmpty()
  type!: string;

  @Matches(UUID_FORMAT, { message: 'refId debe ser un UUID valido' })
  refId!: string;
}
