import { Controller, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { PetsService } from '../services/pets.service';
import { CreatePetDto } from '../dto/create-pet.dto';
import { UpdatePetDto } from '../dto/update-pet.dto';

// Importaciones desde la librería compartida del monorepositorio
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { Roles } from '@app/shared/decorators/roles.decorator';

@Controller('pets')
@UseGuards(JwtHeadersGuard, RolesGuard) // Protege todas las rutas del controlador
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @Roles('admin', 'vet', 'reception') // BR-14: Solo roles autorizados
  async create(@Body() createPetDto: CreatePetDto) {
    return this.petsService.create(createPetDto);
  }

  @Put(':id')
  @Roles('admin', 'vet', 'reception') // BR-14: Solo roles autorizados
  async update(
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
  ) {
    return this.petsService.update(id, updatePetDto);
  }
}