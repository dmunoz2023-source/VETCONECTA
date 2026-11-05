import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../clients/entities/client.entity';
import { Pet } from './entities/pet.entity';
import { PetsController } from './controllers/pets.controller';
import { PetsRepository } from './repositories/pets.repository';
import { PetsService } from './services/pets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pet, Client])],
  controllers: [PetsController],
  providers: [PetsRepository, PetsService],
  exports: [PetsRepository],
})
export class PetsModule {}
