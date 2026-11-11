import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Rating } from './entities/rating.entity';
import { AppointmentsRepository } from './repositories/appointments.repository';
import { RatingsRepository } from './repositories/ratings.repository';
import { AppointmentsService } from './services/appointments.service';
import { AppointmentsController } from './controllers/appointments.controller';
import { InternalAppointmentsController } from '../../internal/internal-appointments.controller';
import { InternalKeyGuard } from '@app/shared/guards/internal-key.guard';

/**
 * [A3][C3] Capa de datos (repositorios) mas el endpoint GET /v1/citas
 * (controller + service) que consume AppointmentsRepository.findByClient.
 * [F3] Ademas expone GET /internal/appointments (citas pasadas de una mascota).
 */
@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Rating])],
  controllers: [AppointmentsController, InternalAppointmentsController],
  providers: [AppointmentsRepository, RatingsRepository, AppointmentsService, InternalKeyGuard],
  exports: [AppointmentsRepository, RatingsRepository],
})
export class AppointmentsModule {}
