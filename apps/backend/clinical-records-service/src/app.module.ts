import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClinicalRecordsModule } from './modules/clinical-records.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
   ClinicalRecordsModule,],
  controllers: [],
  providers: [],
})
export class AppModule {}