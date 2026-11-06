import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { ClientsRepository } from '../repositories/clients.repository';
import { PetsService } from '../../pets/services/pets.service';

@Controller('v1/clients')
@UseGuards(JwtHeadersGuard, RolesGuard)
export class ClientsController {
  constructor(
    private readonly clientsRepository: ClientsRepository,
    private readonly petsService: PetsService,
  ) {}

  /**
   * GET /v1/clients/:id (FR-5)
   * Obten la ficha del cliente junto con el listado de sus mascotas asociadas.
   */
  @Get(':id')
  @Roles('vet', 'reception', 'admin')
  async getClient(@Param('id') clientId: string) {
    const client = await this.clientsRepository.findById(clientId);

    if (!client) {
      throw new NotFoundException(
        `El cliente con ID ${clientId} no fue encontrado.`,
      );
    }

    const pets = await this.petsService.findByClientId(clientId);

    return {
      ...client,
      pets,
    };
  }

  /**
   * GET /v1/clients/me/pets (FR-11, BR-8, BR-12)
   * Selector multi-mascota para el dueño autenticado.
   */
  @Get('me/pets')
  @Roles('owner')
  async getMyPets(@CurrentUser() user: JwtPayload) {
    const clientId =
      user.clientId ?? (await this.clientsRepository.findByUserId(user.sub))?.id;

    if (!clientId) {
      throw new UnauthorizedException(
        'El usuario autenticado no tiene un ID de cliente asociado.',
      );
    }

    return this.petsService.findByClientId(clientId);
  }
}