import { IsISO8601, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';


const UUID_FORMAT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CreateReminderDto {
  @Matches(UUID_FORMAT, { message: 'appointmentId debe ser un UUID valido' })
  appointmentId!: string;

  @Matches(UUID_FORMAT, { message: 'ownerUserId debe ser un UUID valido' })
  ownerUserId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  petName!: string;

  @IsISO8601()
  startsAt!: string;
}
