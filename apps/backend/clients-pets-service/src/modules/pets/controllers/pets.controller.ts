import { Controller, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { PetsService } from '../services/pets.service';
import { CreatePetDto } from '../dto/create-pet.dto';
import { UpdatePetDto } from '../dto/update-pet.dto';

// Nota: Ajusta las rutas de importación de tus Guards y Decoradores de Roles según tu estructura de Auth
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guard';
// import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('pets')
// @UseGuards(JwtAuthGuard, RolesGuard) // Aplica la autenticación a nivel de controlador si corresponde
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  // @Roles('admin', 'vet', 'reception') // BR-14: Restringido a roles autorizados
  async create(@Body() createPetDto: CreatePetDto) {
    return this.petsService.create(createPetDto);
  }

  @Put(':id')
  // @Roles('admin', 'vet', 'reception') // BR-14: Restringido a roles autorizados
  async update(
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
  ) {
    return this.petsService.update(id, updatePetDto);
  }
}