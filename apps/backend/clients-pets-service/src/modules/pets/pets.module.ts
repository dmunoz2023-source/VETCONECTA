import { Module } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PetsController } from './controllers/pet.controller';
import { PetsService } from './services/pets.service';
import { PetEntity } from './entities/pet.entity';
import { InMemoryPetRepository } from './repositories/in-memory-pet.repository';

@Module({
  imports: [],
  controllers: [PetsController],
  providers: [
    PetsService,
    {
      provide: getRepositoryToken(PetEntity),
      useClass: InMemoryPetRepository,
    },
  ],
  exports: [PetsService],
})
export class PetsModule {}