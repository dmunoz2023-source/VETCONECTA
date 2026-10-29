import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { AppointmentsService } from '../services/appointments.service';
import { GetCitasQueryDto } from '../dto/get-citas-query.dto';
import { CreateCitaDto } from '../dto/create-cita.dto';
import { UpdateEstadoDto } from '../dto/update-estado.dto';

/**
 * [C3] GET /v1/citas — el dueño consulta sus propias citas agendadas,
 * historicas y canceladas (FR-3, BR-8). Requiere las cabeceras del
 * Gateway (JwtHeadersGuard) y esta reservado al rol owner (RolesGuard).
 */
@Controller('v1/citas')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @UseGuards(JwtHeadersGuard, RolesGuard)
  @Roles('owner')
  async getMyCitas(@CurrentUser() user: JwtPayload, @Query() query: GetCitasQueryDto) {
    return this.appointmentsService.findMyCitas(user.clientId, query);
  }

  /**
   * [G2] POST /v1/citas — reserva una hora (FR-3, BR-5). El dueño solo puede
   * reservar para sus mascotas (BR-8); recepcion y admin para cualquiera.
   */
  @Post()
  @UseGuards(JwtHeadersGuard, RolesGuard)
  @Roles('owner', 'reception', 'admin')
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCitaDto) {
    return this.appointmentsService.create(user, dto);
  }

  /** [G2] PATCH /v1/citas/:id/cancelar — cancela y libera el horario. */
  @Patch(':id/cancelar')
  @UseGuards(JwtHeadersGuard, RolesGuard)
  @Roles('owner', 'reception', 'admin')
  async cancel(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.cancel(user, id);
  }

  /** [G2] PATCH /v1/citas/:id/estado — marca la cita como atendida o inasistente. */
  @Patch(':id/estado')
  @UseGuards(JwtHeadersGuard, RolesGuard)
  @Roles('vet', 'reception', 'admin')
  async updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEstadoDto,
  ) {
    return this.appointmentsService.updateStatus(user, id, dto.status);
  }
}
