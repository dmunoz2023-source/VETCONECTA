import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalEventController } from './controllers/clinical-event.controller';
import { ClinicalEventEntity } from './entities/clinical-event.entity';
import { ClinicalEventRepository } from './repositories/clinical-event.repository';
import { ClinicalEventService } from './services/clinical-event.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClinicalEventEntity])],
  controllers: [ClinicalEventController],
  providers: [ClinicalEventRepository, ClinicalEventService],
})
export class ClinicalEventModule {}
