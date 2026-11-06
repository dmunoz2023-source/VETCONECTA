import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalEventEntity } from './modules/auth/entities/clinical-event.entity';
import { ClinicalEventModule } from './modules/auth/clinical-event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        schema: 'clinical',
        entities: [ClinicalEventEntity],
        synchronize: false,
        autoLoadEntities: false,
      }),
    }),
    ClinicalEventModule,
  ],
})
export class AppModule {}