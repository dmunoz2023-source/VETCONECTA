import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalEventModule } from '../clinical/clinical-event.module';
import { ClinicalEventEntity } from '../clinical/entities/clinical-event.entity';
import { VaccinationDetailsEntity } from '../clinical/entities/vaccination-details.entity';
import { AppointmentsClient, HttpAppointmentsClient } from './clients/appointments.client';
import { HttpVetsLookup, VetsLookup } from './clients/vets.lookup';
import { HistoryController } from './controllers/history.controller';
import { HistoryRepository } from './repositories/history.repository';
import { HistoryService } from './services/history.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClinicalEventEntity, VaccinationDetailsEntity]),
    HttpModule,
    ClinicalEventModule,
  ],
  controllers: [HistoryController],
  providers: [
    HistoryService,
    HistoryRepository,
    { provide: VetsLookup, useClass: HttpVetsLookup },
    { provide: AppointmentsClient, useClass: HttpAppointmentsClient },
  ],
})
export class HistoryModule {}
