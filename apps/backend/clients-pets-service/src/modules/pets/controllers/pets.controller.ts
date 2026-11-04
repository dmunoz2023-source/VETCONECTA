import { Controller, Get, UseGuards, UnauthorizedException } from '@nestjs/common';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { ClientsRepository } from '../../clients/repositories/clients.repository';
import { PetsService } from '../services/pets.service';
/*Sin swagger*/
@Controller('v1/pets')
export class PetsController {
  constructor(
    private readonly petsService: PetsService,
    private readonly clientsRepository: ClientsRepository,
  ) {}

  @Get('my-pets')
  @UseGuards(JwtHeadersGuard)
  async getMyPets(@CurrentUser() user: JwtPayload) {
    const clientId =
      user.clientId ?? (await this.clientsRepository.findByUserId(user.sub))?.id;

    if (!clientId) {
      throw new UnauthorizedException('El usuario autenticado no tiene un ID de cliente asociado.');
    }

    return await this.petsService.findByClientId(clientId);
  }
}