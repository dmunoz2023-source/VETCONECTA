import { Controller, Get, UseGuards, UnauthorizedException } from '@nestjs/common';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { PetsService } from '../services/pets.service';
/*Sin swagger*/
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get('my-pets')
  @UseGuards(JwtHeadersGuard)
  async getMyPets(@CurrentUser() user: JwtPayload) {
    const clientId = user.clientId || user.sub;

    if (!clientId) {
      throw new UnauthorizedException('El usuario autenticado no tiene un ID de cliente asociado.');
    }

    return await this.petsService.findByClientId(clientId);
  }
}