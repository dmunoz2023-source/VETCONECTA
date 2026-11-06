import { ApiProperty } from '@nestjs/swagger';

export class AvailabilityBlockDto {
  @ApiProperty({
    example: '2026-11-09T09:00:00-03:00',
    description: 'ISO 8601 con el desfase de America/Santiago. Es el startTime para reservar.',
  })
  startTime: string;

  @ApiProperty({ example: '2026-11-09T09:30:00-03:00' })
  endTime: string;
}
