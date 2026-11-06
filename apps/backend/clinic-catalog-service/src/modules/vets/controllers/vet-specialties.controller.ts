import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { AssignSpecialtyDto } from '../dto/assign-specialty.dto';
import { VetsService } from '../services/vets.service';

/** [G3] Especialidades de un veterinario. Solo recepción y admin. */
@ApiTags('catalog')
@ApiBearerAuth()
@Controller('v1/catalog/vets/:vetId/specialties')
@UseGuards(JwtHeadersGuard, RolesGuard)
@Roles('reception', 'admin')
export class VetSpecialtiesController {
  constructor(private readonly vetsService: VetsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar las especialidades de un veterinario' })
  findAll(@Param('vetId', ParseUUIDPipe) vetId: string) {
    return this.vetsService.findSpecialties(vetId);
  }

  @Post()
  @ApiOperation({ summary: 'Asignar una especialidad a un veterinario' })
  assign(@Param('vetId', ParseUUIDPipe) vetId: string, @Body() dto: AssignSpecialtyDto) {
    return this.vetsService.assignSpecialty(vetId, dto.specialtyId);
  }

  @Delete(':specialtyId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Quitar una especialidad a un veterinario' })
  unassign(
    @Param('vetId', ParseUUIDPipe) vetId: string,
    @Param('specialtyId', ParseUUIDPipe) specialtyId: string,
  ) {
    return this.vetsService.unassignSpecialty(vetId, specialtyId);
  }
}
