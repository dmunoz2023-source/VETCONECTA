import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalRecordsController } from './auth/controllers/clinical-records.controller';
import { ClinicalRecordsService } from './auth/services/clinical-records.service';
import { ClinicalEventEntity } from './auth/entities/clinical-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClinicalEventEntity]),
  ],
  controllers: [ClinicalRecordsController],
  providers: [ClinicalRecordsService],
  exports: [ClinicalRecordsService],
})
export class ClinicalRecordsModule {}