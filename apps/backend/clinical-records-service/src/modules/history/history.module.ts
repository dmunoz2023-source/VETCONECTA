import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsClient, HttpAppointmentsClient } from './clients/appointments.client';
import { HttpPetsLookup, PetsLookup } from './clients/pets.lookup';
import { HttpVetsLookup, VetsLookup } from './clients/vets.lookup';
import { HistoryController } from './controllers/history.controller';
import { ClinicalEvent } from './entities/clinical-event.entity';
import { VaccinationDetail } from './entities/vaccination-detail.entity';
import { HistoryRepository } from './repositories/history.repository';
import { HistoryService } from './services/history.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClinicalEvent, VaccinationDetail]), HttpModule],
  controllers: [HistoryController],
  providers: [
    HistoryService,
    HistoryRepository,
    { provide: PetsLookup, useClass: HttpPetsLookup },
    { provide: VetsLookup, useClass: HttpVetsLookup },
    { provide: AppointmentsClient, useClass: HttpAppointmentsClient },
  ],
})
export class HistoryModule {}
