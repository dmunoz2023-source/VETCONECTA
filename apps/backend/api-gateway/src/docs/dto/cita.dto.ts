import { ApiProperty } from '@nestjs/swagger';

// Esquemas de documentacion del dominio scheduling (proxied a :3004).
// Reflejan la respuesta real de GET /v1/citas (tarea C3).

export class CitaDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  slotId: string;

  @ApiProperty({ format: 'uuid' })
  petId: string;

  @ApiProperty({ format: 'uuid' })
  clientId: string;

  @ApiProperty({ format: 'uuid' })
  vetUserId: string;

  @ApiProperty({ format: 'uuid' })
  specialtyId: string;

  @ApiProperty({ format: 'date-time' })
  startTime: string;

  @ApiProperty({ format: 'date-time' })
  endTime: string;

  @ApiProperty({ enum: ['booked', 'confirmed', 'completed', 'cancelled', 'no_show'] })
  status: string;

  @ApiProperty({ example: 'app' })
  channel: string;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 3 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class PaginatedCitasDto {
  @ApiProperty({ type: [CitaDto] })
  data: CitaDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
