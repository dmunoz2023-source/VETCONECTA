import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '../config/configuration';
import { Specialty } from '../modules/specialties/entities/specialty.entity';
import { Vet } from '../modules/vets/entities/vet.entity';
import { VetSpecialty } from '../modules/vets/entities/vet-specialty.entity';

/**
 * [G3] Conexión aislada al esquema `catalog`. `synchronize: false`: la única
 * fuente de verdad del esquema es infra/db/01-tables.sql.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        type: 'postgres',
        url: config.get('databaseUrl', { infer: true }),
        schema: config.get('dbSchema', { infer: true }),
        entities: [Specialty, Vet, VetSpecialty],
        synchronize: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
