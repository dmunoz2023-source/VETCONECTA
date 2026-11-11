import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialtiesController } from './controllers/specialties.controller';
import { Specialty } from './entities/specialty.entity';
import { SpecialtiesRepository } from './repositories/specialties.repository';
import { SpecialtiesService } from './services/specialties.service';

@Module({
  imports: [TypeOrmModule.forFeature([Specialty])],
  controllers: [SpecialtiesController],
  providers: [SpecialtiesRepository, SpecialtiesService],
  exports: [SpecialtiesService],
})
export class SpecialtiesModule {}
