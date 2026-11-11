import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { UpdateClientProfileDto } from '../dto/update-client-profile.dto';
import { ClientsService } from '../services/clients.service';

@Controller('v1/clients')
@UseGuards(JwtHeadersGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * GET /v1/clients?q=&page=&limit= (FR-5)
   * Busca clientes activos por RUT, nombre completo o teléfono.
   * Accesible para reception, admin y vet.
   */
  @Get()
  @Roles('reception', 'admin', 'vet')
  async getClients(
    @Query('q') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.clientsService.findAll(search, Number(page), Number(limit));
  }

  @Post()
  @Roles('reception', 'admin')
  async createClient(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get('me')
  @Roles('owner')
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.clientsService.getMyProfile(user);
  }

  @Patch('me')
  @Roles('owner')
  async updateMyProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateProfileDto: UpdateClientProfileDto,
  ) {
    return this.clientsService.updateMyProfile(user, updateProfileDto);
  }

  @Get('me/pets')
  @Roles('owner')
  async getMyPets(@CurrentUser() user: JwtPayload) {
    return this.clientsService.getMyPets(user);
  }

  @Get(':id')
  @Roles('reception', 'admin', 'vet')
  async getClient(@Param('id') clientId: string) {
    return this.clientsService.findById(clientId);
  }

  @Patch(':id')
  @Roles('reception', 'admin')
  async updateClient(
    @Param('id') clientId: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(clientId, updateClientDto);
  }
}