import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './common/health.controller';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { DatabaseModule } from './database/database.module';
import { SpecialtiesModule } from './modules/specialties/specialties.module';
import { VetsModule } from './modules/vets/vets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    DatabaseModule,
    SpecialtiesModule,
    VetsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
