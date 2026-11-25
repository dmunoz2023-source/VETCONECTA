import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { InternalKeyGuard } from '@app/shared/guards/internal-key.guard';
import { AppointmentsService } from '../modules/appointments/services/appointments.service';
import { PastAppointmentsQueryDto } from '../modules/appointments/dto/past-appointments-query.dto';

/**
 * [F3] GET /internal/appointments?petId=&from=&to= — citas pasadas de una mascota
 * con su estado. Ruta privada entre servicios: protegida por X-Internal-Key y
 * nunca publicada en el Gateway ni en el contrato público.
 */
@ApiExcludeController()
@Controller('internal/appointments')
@UseGuards(InternalKeyGuard)
export class InternalAppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  async findPast(@Query() query: PastAppointmentsQueryDto) {
    return this.appointmentsService.findPastByPet(query);
  }
}
