import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { DatabaseModule } from './database/database.module';
import { InternalModule } from './internal/internal.module';
import { RemindersModule } from './modules/reminders/reminders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    RemindersModule,
    InternalModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}