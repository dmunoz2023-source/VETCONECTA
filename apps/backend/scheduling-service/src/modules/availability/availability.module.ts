import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsModule } from '../appointments/appointments.module';
import { SchedulesModule } from '../schedules/schedules.module';
import { AvailabilityController } from './controllers/availability.controller';
import { AvailabilitySlot } from './entities/availability-slot.entity';
import { AvailabilityRepository } from './repositories/availability.repository';
import { AvailabilityService } from './services/availability.service';

@Module({
  imports: [TypeOrmModule.forFeature([AvailabilitySlot]), SchedulesModule, AppointmentsModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityRepository, AvailabilityService],
  exports: [AvailabilityRepository],
})
export class AvailabilityModule {}
