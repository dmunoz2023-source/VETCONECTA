import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsModule } from '../appointments/appointments.module';
import { CatalogClient } from './clients/catalog.client';
import { VetBlocksController } from './controllers/vet-blocks.controller';
import { VetSchedulesController } from './controllers/vet-schedules.controller';
import { VetBlock } from './entities/vet-block.entity';
import { VetSchedule } from './entities/vet-schedule.entity';
import { VetBlocksRepository } from './repositories/vet-blocks.repository';
import { VetSchedulesRepository } from './repositories/vet-schedules.repository';
import { DayBlocksService } from './services/day-blocks.service';
import { VetBlocksService } from './services/vet-blocks.service';
import { VetSchedulesService } from './services/vet-schedules.service';

/** [G3] Horarios, bloqueos y generación de bloques de un veterinario. */
@Module({
  imports: [TypeOrmModule.forFeature([VetSchedule, VetBlock]), AppointmentsModule],
  controllers: [VetSchedulesController, VetBlocksController],
  providers: [
    CatalogClient,
    VetSchedulesRepository,
    VetBlocksRepository,
    VetSchedulesService,
    VetBlocksService,
    DayBlocksService,
  ],
  exports: [CatalogClient, VetBlocksRepository, DayBlocksService],
})
export class SchedulesModule {}
