import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { CreateSpecialtyDto } from '../dto/create-specialty.dto';
import { UpdateSpecialtyDto } from '../dto/update-specialty.dto';
import { SpecialtiesService } from '../services/specialties.service';

/** [G3] Lectura para cualquier usuario autenticado; escritura solo recepción y admin. */
@ApiTags('catalog')
@ApiBearerAuth()
@Controller('v1/catalog/specialties')
@UseGuards(JwtHeadersGuard, RolesGuard)
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar especialidades activas con su duración' })
  findActive() {
    return this.specialtiesService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una especialidad' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.specialtiesService.findById(id);
  }

  @Post()
  @Roles('reception', 'admin')
  @ApiOperation({ summary: 'Crear una especialidad' })
  create(@Body() dto: CreateSpecialtyDto) {
    return this.specialtiesService.create(dto);
  }

  @Patch(':id')
  @Roles('reception', 'admin')
  @ApiOperation({ summary: 'Editar o reactivar una especialidad' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSpecialtyDto) {
    return this.specialtiesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('reception', 'admin')
  @ApiOperation({ summary: 'Desactivar una especialidad (baja lógica)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.specialtiesService.deactivate(id);
  }
}
