import {Body, Controller, Get, Param, Post, Put, UnauthorizedException, UseGuards,} from '@nestjs/common';
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

  @Post()
  @Roles('admin', 'vet', 'reception')
  async create(@Body() createPetDto: CreatePetDto) {
    return this.petsService.create(createPetDto);
  }

  @Put(':id')
  @Roles('admin', 'vet', 'reception')
  async update(
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
  ) {
    return this.petsService.update(id, updatePetDto);
  }

  @Get('my-pets')
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
