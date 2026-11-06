import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { ClientsService } from '../services/clients.service';

@Controller('v1/clients')
@UseGuards(JwtHeadersGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * GET /v1/clients/me (FR-14)
   * Perfil del dueño autenticado.
   */
  @Get('me')
  @Roles('owner')
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.clientsService.getMyProfile(user);
  }

  /**
   * GET /v1/clients/me/pets (FR-11, BR-8, BR-12)
   * Selector multi-mascota para el dueño autenticado.
   */
  @Get('me/pets')
  @Roles('owner')
  async getMyPets(@CurrentUser() user: JwtPayload) {
    return this.clientsService.getMyPets(user);
  }

  /**
   * GET /v1/clients/:id (FR-5)
   * Ficha del cliente junto con el listado de sus mascotas asociadas.
   */
  @Get(':id')
  @Roles('vet', 'reception', 'admin')
  async getClient(@Param('id') clientId: string) {
    return this.clientsService.findById(clientId);
  }
}