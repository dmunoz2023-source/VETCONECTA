import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { DatabaseModule } from './database/database.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { HealthController } from './common/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    DatabaseModule,
    AvailabilityModule,
    AppointmentsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
