import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '../config/configuration';
import { ClinicalEvent } from '../modules/history/entities/clinical-event.entity';
import { VaccinationDetail } from '../modules/history/entities/vaccination-detail.entity';

/**
 * Punto único de conexión de clinical-records-service a PostgreSQL.
 *
 * Aislamiento por esquema: solo se registran entidades de `clinical` y se fija
 * `schema: dbSchema`. Ningún repositorio de este servicio apunta a tablas de
 * otros esquemas (no hay JOIN entre esquemas: mascotas, veterinarios y citas se
 * consultan por HTTP a rutas /internal).
 *
 * `synchronize: false` siempre: la única fuente de verdad del esquema es
 * infra/db/01-tables.sql.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        type: 'postgres' as const,
        url: configService.get('databaseUrl', { infer: true }),
        schema: configService.get('dbSchema', { infer: true }),
        entities: [ClinicalEvent, VaccinationDetail],
        synchronize: false,
        logging: process.env.NODE_ENV !== 'production',
      }),
    }),
  ],
})
export class DatabaseModule {}
