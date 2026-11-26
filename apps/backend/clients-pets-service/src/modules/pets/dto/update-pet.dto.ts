import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreatePetDto } from './create-pet.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePetDto extends PartialType(CreatePetDto) {
  @ApiPropertyOptional({ example: true, description: 'false = mascota dada de baja.' })
  @IsBoolean({ message: 'El campo active debe ser un valor booleano' })
  @IsOptional()
  active?: boolean;
}