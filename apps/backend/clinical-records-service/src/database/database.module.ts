import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClinicalEventEntity } from '../modules/clinical/entities/clinical-event.entity';
import { TreatmentEntity } from '../modules/clinical/entities/treatment.entity';
import { VaccinationDetailsEntity } from '../modules/clinical/entities/vaccination-details.entity';

/**
 * Punto único de conexión de clinical-records-service a PostgreSQL.
 *
 * Aislamiento por esquema: solo se registran entidades de `clinical` y se fija
 * `schema: 'clinical'`. Ningún repositorio de este servicio apunta a tablas de
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
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        schema: 'clinical',
        entities: [
          ClinicalEventEntity,
          VaccinationDetailsEntity,
          TreatmentEntity,
        ],
        synchronize: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
