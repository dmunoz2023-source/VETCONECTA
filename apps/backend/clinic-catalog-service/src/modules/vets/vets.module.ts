import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalVetsController } from '../../internal/controllers/internal-vets.controller';
import { SpecialtiesModule } from '../specialties/specialties.module';
import { VetSpecialtiesController } from './controllers/vet-specialties.controller';
import { VetSpecialty } from './entities/vet-specialty.entity';
import { Vet } from './entities/vet.entity';
import { VetsRepository } from './repositories/vets.repository';
import { VetsService } from './services/vets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vet, VetSpecialty]), SpecialtiesModule],
  controllers: [VetSpecialtiesController, InternalVetsController],
  providers: [VetsRepository, VetsService],
})
export class VetsModule {}
