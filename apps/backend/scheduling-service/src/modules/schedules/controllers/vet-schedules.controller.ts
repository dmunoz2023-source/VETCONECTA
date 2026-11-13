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
import { CreateVetScheduleDto } from '../dto/create-vet-schedule.dto';
import { UpdateVetScheduleDto } from '../dto/update-vet-schedule.dto';
import { VetSchedulesService } from '../services/vet-schedules.service';

/** [G3] Horario semanal de un veterinario. Solo recepción y admin. */
@ApiTags('scheduling')
@ApiBearerAuth()
@Controller('v1/scheduling/vets/:vetId/schedules')
@UseGuards(JwtHeadersGuard, RolesGuard)
@Roles('reception', 'admin')
export class VetSchedulesController {
  constructor(private readonly schedulesService: VetSchedulesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar el horario semanal de un veterinario' })
  findAll(@Param('vetId', ParseUUIDPipe) vetId: string) {
    return this.schedulesService.findByVet(vetId);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar un turno; 409 si se solapa con otro' })
  create(@Param('vetId', ParseUUIDPipe) vetId: string, @Body() dto: CreateVetScheduleDto) {
    return this.schedulesService.create(vetId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar un turno; 409 si se solapa con otro' })
  update(
    @Param('vetId', ParseUUIDPipe) vetId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVetScheduleDto,
  ) {
    return this.schedulesService.update(vetId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un turno' })
  remove(@Param('vetId', ParseUUIDPipe) vetId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.schedulesService.remove(vetId, id);
  }
}
