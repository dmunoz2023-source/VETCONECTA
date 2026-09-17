import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { PetsService } from '../services/pets.service';

@Controller('mascotas')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  async getMisMascotas(@Headers('x-client-id') clientId: string) {
    if (!clientId) {
      throw new UnauthorizedException('No se proporcionó la identidad del cliente (x-client-id)');
    }

    return await this.petsService.findByClientId(clientId);
  }
} 