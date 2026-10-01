import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetEntity } from './entities/pet.entity';
import { PetsRepository } from './repositories/pets.repository';
/*MODIFICADO SOLO import Pet -> PetEntity para que coincida¨*/

@Module({
  imports: [TypeOrmModule.forFeature([PetEntity])],
  providers: [PetsRepository],
  exports: [PetsRepository],
})
export class PetsModule {}
