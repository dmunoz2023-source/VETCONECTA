import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class GetVetBlocksQueryDto {
  @ApiPropertyOptional({ example: '2026-12-01', description: 'Desde esta fecha, inclusive.' })
  @IsOptional()
  @IsDateString({ strict: true })
  from?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Hasta esta fecha, inclusive.' })
  @IsOptional()
  @IsDateString({ strict: true })
  to?: string;
}
