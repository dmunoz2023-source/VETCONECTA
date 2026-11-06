import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Matches, Max, Min } from 'class-validator';

export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
export const TIME_MESSAGE = 'debe tener formato HH:mm';

export class CreateVetScheduleDto {
  @ApiProperty({ example: 1, minimum: 0, maximum: 6, description: '0 = domingo ... 6 = sábado.' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00', description: 'Hora local de la clínica.' })
  @Matches(TIME_PATTERN, { message: `startTime ${TIME_MESSAGE}` })
  startTime: string;

  @ApiProperty({ example: '13:00', description: 'Hora local de la clínica.' })
  @Matches(TIME_PATTERN, { message: `endTime ${TIME_MESSAGE}` })
  endTime: string;
}
