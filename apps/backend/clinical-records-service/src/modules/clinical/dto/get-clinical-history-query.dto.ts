import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetClinicalHistoryQueryDto {
  @ApiPropertyOptional({ description: 'Número de página', minimum: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ description: 'Resultados por página (máximo 50)', minimum: 1, maximum: 50, default: 10 })
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 10;
}
