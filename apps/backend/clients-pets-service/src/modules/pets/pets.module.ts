import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from '../clients/clients.module';
import { PetsController } from './controllers/pets.controller';
import { PetEntity } from './entities/pet.entity';
import { PetsRepository } from './repositories/pets.repository';
import { PetsService } from './services/pets.service';

@Module({
  imports: [TypeOrmModule.forFeature([PetEntity]), ClientsModule],
  controllers: [PetsController],
  providers: [PetsService, PetsRepository],
  exports: [PetsService, PetsRepository],
})
export class PetsModule {}
