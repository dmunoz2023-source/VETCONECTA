import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsPetsClient } from './clients/clients-pets.client';
import { ClinicalEventController } from './controllers/clinical-event.controller';
import { ClinicalEventEntity } from './entities/clinical-event.entity';
import { TreatmentEntity } from './entities/treatment.entity';
import { VaccinationDetailsEntity } from './entities/vaccination-details.entity';
import { ClinicalEventRepository } from './repositories/clinical-event.repository';
import { ClinicalEventService } from './services/clinical-event.service';

@Module({
  imports: [
    HttpModule.register({ timeout: 3000 }),
    TypeOrmModule.forFeature([
      ClinicalEventEntity,
      VaccinationDetailsEntity,
      TreatmentEntity,
    ]),
  ],
  controllers: [ClinicalEventController],
  providers: [
    ClientsPetsClient,
    ClinicalEventRepository,
    ClinicalEventService,
  ],
  exports: [ClientsPetsClient],
})
export class ClinicalEventModule {}
