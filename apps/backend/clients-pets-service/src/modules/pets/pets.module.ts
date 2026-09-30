import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pet } from './entities/pet.entity';
import { PetsRepository } from './repositories/pets.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Pet])],
  providers: [PetsRepository],
  exports: [PetsRepository],
})
export class PetsModule {}
