import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, Matches } from 'class-validator';

// Matches y no IsUUID: los ids del seed no son UUID v4 y IsUUID los rechaza.
const UUID_FORMAT = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

export class GetAvailabilityQueryDto {
  @ApiProperty({ format: 'uuid', example: '44444444-4444-4444-4444-444444444441' })
  @Matches(UUID_FORMAT, { message: 'specialtyId debe tener formato UUID' })
  specialtyId: string;

  @ApiProperty({ format: 'uuid', example: '55555555-5555-5555-5555-555555555551' })
  @Matches(UUID_FORMAT, { message: 'vetId debe tener formato UUID' })
  vetId: string;

  @ApiProperty({ example: '2026-11-09', description: 'Fecha local de la clínica, inclusive.' })
  @IsDateString({ strict: true })
  @Matches(DATE_FORMAT, { message: 'from debe tener formato YYYY-MM-DD' })
  from: string;

  @ApiProperty({
    example: '2026-11-15',
    description: 'Fecha local de la clínica, inclusive. Máximo 30 días desde `from`.',
  })
  @IsDateString({ strict: true })
  @Matches(DATE_FORMAT, { message: 'to debe tener formato YYYY-MM-DD' })
  to: string;
}
