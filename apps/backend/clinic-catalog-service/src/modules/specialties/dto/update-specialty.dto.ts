import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateSpecialtyDto } from './create-specialty.dto';

export class UpdateSpecialtyDto extends PartialType(CreateSpecialtyDto) {
  @ApiPropertyOptional({ description: 'false desactiva la especialidad.' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
