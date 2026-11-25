import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalKeyGuard } from '@app/shared/guards/internal-key.guard';
import { Appointment } from './entities/appointment.entity';
import { Rating } from './entities/rating.entity';
import { AuditLog } from './entities/audit-log.entity';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';
import { AvailabilityPort } from './availability/availability.port';
import { SlotAvailabilityAdapter } from './availability/slot-availability.adapter';
import { AppointmentsRepository } from './repositories/appointments.repository';
import { RatingsRepository } from './repositories/ratings.repository';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { AppointmentsService } from './services/appointments.service';
import { AppointmentsController } from './controllers/appointments.controller';
import { InternalAppointmentsController } from '../../internal/internal-appointments.controller';
import { HttpPetsLookup, PetsLookup } from './clients/pets.lookup';
import { HttpRemindersClient, RemindersClient } from './clients/reminders.client';

/**
 * [A3][C3] Capa de datos (repositorios) mas el endpoint GET /v1/scheduling/appointments/me
 * (controller + service) que consume AppointmentsRepository.findByClient.
 * [G2] Reserva, cancelacion y cambio de estado de citas.
 * [F3] Ademas expone GET /internal/appointments (citas pasadas de una mascota).
 */
@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Rating, AuditLog, AvailabilitySlot]), HttpModule],
  controllers: [AppointmentsController, InternalAppointmentsController],
  providers: [
    AppointmentsRepository,
    RatingsRepository,
    AuditLogRepository,
    AppointmentsService,
    InternalKeyGuard,
    { provide: PetsLookup, useClass: HttpPetsLookup },
    { provide: RemindersClient, useClass: HttpRemindersClient },
    { provide: AvailabilityPort, useClass: SlotAvailabilityAdapter },
  ],
  exports: [AppointmentsRepository, RatingsRepository],
})
export class AppointmentsModule {}
