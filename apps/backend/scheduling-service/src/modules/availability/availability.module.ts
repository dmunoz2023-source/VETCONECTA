import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilitySlot } from './entities/availability-slot.entity';
import { AvailabilityRepository } from './repositories/availability.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AvailabilitySlot])],
  providers: [AvailabilityRepository],
  exports: [AvailabilityRepository],
})
export class AvailabilityModule {}
