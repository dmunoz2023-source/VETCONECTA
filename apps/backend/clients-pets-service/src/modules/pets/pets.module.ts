import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from '../clients/clients.module';
import { PetEntity } from './entities/pet.entity';
import { PetsRepository } from './repositories/pets.repository';
import { PetsService } from './services/pets.service'; // Ajusta la ruta si está en otra carpeta
import { PetsController } from './controllers/pet.controller'; // Ajusta la ruta si está en otra carpeta
/*MODIFICADO SOLO import Pet -> PetEntity para que coincida¨*/

@Module({
  imports: [TypeOrmModule.forFeature([PetEntity]), ClientsModule],
  controllers: [PetsController],
  providers: [PetsService, PetsRepository],
  exports: [PetsService, PetsRepository],
})
export class PetsModule {}