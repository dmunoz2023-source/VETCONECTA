import { Module } from '@nestjs/common';
import { ConfigModule} from '@nestjs/config';
import { ClinicalEventModule } from './modules/clinical/clinical-event.module';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    DatabaseModule,
    ClinicalEventModule,
  ],
  controllers:[],
  providers:[]
})
export class AppModule {}