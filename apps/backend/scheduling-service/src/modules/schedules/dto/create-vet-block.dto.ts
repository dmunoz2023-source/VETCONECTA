import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { TIME_MESSAGE, TIME_PATTERN } from './create-vet-schedule.dto';

export class CreateVetBlockDto {
  @ApiProperty({ example: '2026-12-25', description: 'Fecha local de la clínica.' })
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date debe tener formato YYYY-MM-DD' })
  date: string;

  @ApiPropertyOptional({ example: '09:00', description: 'Omitir junto con endTime para bloquear el día completo.' })
  @IsOptional()
  @Matches(TIME_PATTERN, { message: `startTime ${TIME_MESSAGE}` })
  startTime?: string | null;

  @ApiPropertyOptional({ example: '13:00', description: 'Omitir junto con startTime para bloquear el día completo.' })
  @IsOptional()
  @Matches(TIME_PATTERN, { message: `endTime ${TIME_MESSAGE}` })
  endTime?: string | null;

  @ApiProperty({ example: 'Feriado' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  reason: string;
}
