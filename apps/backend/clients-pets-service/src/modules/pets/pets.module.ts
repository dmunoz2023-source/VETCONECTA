import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalKeyGuard } from '@app/shared/guards/internal-key.guard';
import { ClientsModule } from '../clients/clients.module';
import { InternalPetsController } from '../../internal/internal-pets.controller';
import { PetsController } from './controllers/pets.controller';
import { PetEntity } from './entities/pet.entity';
import { PetsRepository } from './repositories/pets.repository';
import { PetsService } from './services/pets.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PetEntity]),
    forwardRef(() => ClientsModule),
  ],
  controllers: [PetsController, InternalPetsController],
  providers: [PetsService, PetsRepository, InternalKeyGuard],
  exports: [PetsService, PetsRepository],
})
export class PetsModule {}
