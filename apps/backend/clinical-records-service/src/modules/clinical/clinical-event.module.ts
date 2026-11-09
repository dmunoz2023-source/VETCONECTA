import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalEventController } from './controllers/clinical-event.controller';
import { ClinicalEventEntity } from './entities/clinical-event.entity';
import { VaccinationDetailsEntity } from './entities/vaccination-details.entity';
import { ClinicalEventRepository } from './repositories/clinical-event.repository';
import { ClinicalEventService } from './services/clinical-event.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClinicalEventEntity, VaccinationDetailsEntity])],
  controllers: [ClinicalEventController],
  providers: [
    ClinicalEventRepository,
    ClinicalEventService,
  ],
})
export class ClinicalEventModule {}
