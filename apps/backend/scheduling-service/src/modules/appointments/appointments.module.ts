import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Rating } from './entities/rating.entity';
import { AppointmentsRepository } from './repositories/appointments.repository';
import { RatingsRepository } from './repositories/ratings.repository';

/**
 * [A3] Este módulo por ahora solo expone la capa de datos (repositorios).
 * La tarea C3 (GET /citas) agregará aquí su controller, DTOs y service
 * reutilizando AppointmentsRepository tal como quedó.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Rating])],
  providers: [AppointmentsRepository, RatingsRepository],
  exports: [AppointmentsRepository, RatingsRepository],
})
export class AppointmentsModule {}
