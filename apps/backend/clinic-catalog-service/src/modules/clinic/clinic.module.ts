import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicController } from './controllers/clinic.controller';
import { Clinic } from './entities/clinic.entity';
import { ClinicService } from './services/clinic.service';

@Module({
  imports: [TypeOrmModule.forFeature([Clinic])],
  controllers: [ClinicController],
  providers: [ClinicService],
})
export class ClinicModule {}
