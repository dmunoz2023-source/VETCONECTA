import { Controller, Get, UseGuards } from '@nestjs/common';
import { PetsService } from '../services/pets.service';
import { CurrentUser } from '@libs/shared/decorators/current-user.decorator'; // Decorador de libs/shared
import { JwtHeadersGuard } from '@libs/shared/guards/jwt-headers.guard';     // Guarda de libs/shared

@Controller('mascotas')
@UseGuards(JwtHeadersGuard) // Valida cabeceras e identidad inyectadas por el API Gateway
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  async getMisMascotas(@CurrentUser('clientId') clientId: string) {
    // BR-8 y BR-12: Garantiza que solo consulte las mascotas asociadas a su id de cliente
    return await this.petsService.findByClientId(clientId);
  }
}