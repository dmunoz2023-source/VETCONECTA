import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InternalKeyGuard } from '@app/shared/guards/internal-key.guard';
import { PetsService } from '../modules/pets/services/pets.service';

@Controller('internal/pets')
@UseGuards(InternalKeyGuard)
export class InternalPetsController {
  constructor(private readonly petsService: PetsService) {}

  /**
   * GET /internal/pets/:id
   * Invocación síncrona inter-servicio (BR-4, BR-8) protegida por X-Internal-Key.
   */
  @Get(':id')
  async getInternalPet(@Param('id') id: string) {
    return this.petsService.findInternalById(id);
  }
}