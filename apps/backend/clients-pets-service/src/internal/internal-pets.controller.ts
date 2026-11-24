import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InternalKeyGuard } from '@app/shared/guards/internal-key.guard';
import { ClientsRepository } from '../modules/clients/repositories/clients.repository';
import { PetsService } from '../modules/pets/services/pets.service';

@Controller('internal/pets')
@UseGuards(InternalKeyGuard)
export class InternalPetsController {
  constructor(
    private readonly petsService: PetsService,
    private readonly clientsRepository: ClientsRepository,
  ) {}

  /**
   * GET /internal/pets/:id
   * Invocación síncrona inter-servicio (BR-4, BR-8) protegida por X-Internal-Key.
   */
  @Get(':id')
  async getInternalPet(@Param('id') id: string) {
    return this.petsService.findInternalById(id);
  }

  @Get(':id/owner/:userId')
  async verifyPetOwner(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    const client = await this.clientsRepository.findByUserId(userId);
    if (!client) {
      throw new NotFoundException('No se encontró el cliente del dueño.');
    }

    return this.petsService.findByPetId(client.id, id);
  }
}