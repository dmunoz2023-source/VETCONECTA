import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class AssignSpecialtyDto {
  // Matches y no IsUUID: los ids del seed no son UUID v4 y IsUUID los rechaza.
  @ApiProperty({ format: 'uuid' })
  @Matches(/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i, {
    message: 'specialtyId debe tener formato UUID',
  })
  specialtyId: string;
}
