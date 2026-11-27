import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

export class GetVetsQueryDto {
  // Matches y no IsUUID: los ids del seed no son UUID v4 y IsUUID los rechaza.
  @ApiPropertyOptional({ format: 'uuid', description: 'Solo veterinarios que atienden esta especialidad.' })
  @IsOptional()
  @Matches(/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i, {
    message: 'specialtyId debe tener formato UUID',
  })
  specialtyId?: string;
}
