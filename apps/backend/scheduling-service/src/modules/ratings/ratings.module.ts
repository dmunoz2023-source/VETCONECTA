import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppointmentsModule } from '../appointments/appointments.module';
import { HttpPetOwnerCheck, PetOwnerCheck } from './clients/pet-owner.check';
import { RatingsController } from './controllers/ratings.controller';
import { RatingsService } from './services/ratings.service';

/** [K2] Calificaciones de citas. Reutiliza los repositorios de AppointmentsModule. */
@Module({
  imports: [AppointmentsModule, HttpModule],
  controllers: [RatingsController],
  providers: [RatingsService, { provide: PetOwnerCheck, useClass: HttpPetOwnerCheck }],
})
export class RatingsModule {}
