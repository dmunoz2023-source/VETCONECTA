import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

/** [H1] Parámetros de DELETE /internal/reminders?type=appointment&refId=<uuid>. */
export class CancelRemindersQueryDto {
  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsUUID()
  refId!: string;
}