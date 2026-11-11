import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { VetsService } from '../../modules/vets/services/vets.service';
import { InternalKeyGuard } from '../guards/internal-key.guard';

/**
 * [G3] GET /internal/vets/:id — scheduling-service valida al veterinario y
 * obtiene la duración de sus especialidades. No se publica en el gateway.
 */
@ApiExcludeController()
@Controller('internal/vets')
@UseGuards(InternalKeyGuard)
export class InternalVetsController {
  constructor(private readonly vetsService: VetsService) {}

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.vetsService.getSummary(id);
  }
}
