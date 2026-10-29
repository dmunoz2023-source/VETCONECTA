import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Rating } from './entities/rating.entity';
import { AuditLog } from './entities/audit-log.entity';
import { AppointmentsRepository } from './repositories/appointments.repository';
import { RatingsRepository } from './repositories/ratings.repository';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { AppointmentsService } from './services/appointments.service';
import { AppointmentsController } from './controllers/appointments.controller';
import { HttpPetsLookup, PetsLookup } from './clients/pets.lookup';
import { HttpRemindersClient, RemindersClient } from './clients/reminders.client';

/**
 * [A3][C3] Capa de datos (repositorios) mas el endpoint GET /v1/citas
 * (controller + service) que consume AppointmentsRepository.findByClient.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Rating, AuditLog]), HttpModule],
  controllers: [AppointmentsController],
  providers: [
    AppointmentsRepository,
    RatingsRepository,
    AuditLogRepository,
    AppointmentsService,
    { provide: PetsLookup, useClass: HttpPetsLookup },
    { provide: RemindersClient, useClass: HttpRemindersClient },
  ],
  exports: [AppointmentsRepository, RatingsRepository],
})
export class AppointmentsModule {}
