import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { ClientsRepository } from '../../clients/repositories/clients.repository';
import { CreatePetDto } from '../dto/create-pet.dto';
import { UpdatePetDto } from '../dto/update-pet.dto';
import { PetsService } from '../services/pets.service';

@Controller('v1/pets')
@UseGuards(JwtHeadersGuard, RolesGuard)
export class PetsController {
  constructor(
    private readonly petsService: PetsService,
    private readonly clientsRepository: ClientsRepository,
  ) {}

  /**
   * GET /v1/pets/:id (FR-2, BR-2, BR-8)
   * Ficha de la mascota con la edad calculada al vuelo.
   */
  @Get(':id')
  @Roles('owner', 'vet', 'reception', 'admin')
  async getPet(
    @Param('id') petId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role === 'owner') {
      const clientId =
        user.clientId ?? (await this.clientsRepository.findByUserId(user.sub))?.id;

      if (!clientId) {
        throw new UnauthorizedException(
          'El usuario autenticado no tiene un ID de cliente asociado.',
        );
      }
      return this.petsService.findByPetId(clientId, petId);
    }

    return this.petsService.findById(petId);
  }

  /**
   * POST /v1/pets (FR-5, BR-1)
   * Crea una mascota asociada a un cliente.
   */
  @Post()
  @Roles('admin', 'reception')
  async create(@Body() createPetDto: CreatePetDto) {
    return this.petsService.create(createPetDto);
  }

  /**
   * PATCH /v1/pets/:id (FR-5)
   * Actualización parcial de la ficha de la mascota.
   */
  @Patch(':id')
  @Roles('admin', 'vet', 'reception')
  async update(
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
  ) {
    return this.petsService.update(id, updatePetDto);
  }

  /**
   * DELETE /v1/pets/:id (BR-9)
   * Baja lógica (active = false).
   */
  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.petsService.softDelete(id);
  }
}