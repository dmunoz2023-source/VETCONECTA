import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { AppointmentsService } from '../services/appointments.service';
import { GetCitasQueryDto } from '../dto/get-citas-query.dto';

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
}
