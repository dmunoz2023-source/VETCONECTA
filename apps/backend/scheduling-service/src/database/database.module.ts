import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilitySlot } from '../modules/availability/entities/availability-slot.entity';
import { Appointment } from '../modules/appointments/entities/appointment.entity';
import { Rating } from '../modules/appointments/entities/rating.entity';
import { VetBlock } from '../modules/schedules/entities/vet-block.entity';
import { VetSchedule } from '../modules/schedules/entities/vet-schedule.entity';

/**
 * [A3] Punto único de conexión de scheduling-service a PostgreSQL.
 *
 * Aislamiento por esquema (regla de oro de la arquitectura, §3 del doc de
 * arquitectura): este módulo solo registra las entidades de `scheduling`
 * y fija `schema: 'scheduling'`. Ningún repositorio de este
 * servicio puede terminar apuntando, ni por accidente, a una tabla de
 * `clients_pets`, `clinical`, `catalog`, etc.
 *
 * `synchronize: false` siempre: la única fuente de verdad del esquema es
 * infra/db/01-tables.sql. TypeORM nunca genera ni altera DDL aquí — si se
 * necesita una columna nueva, se agrega al script SQL y se re-ejecuta.
 *
 * Nota de equipo: infra/db/00-schemas.sql todavía no crea un rol de
 * PostgreSQL restringido por esquema (auth_svc, scheduling_svc, etc.), como
 * describe el documento de arquitectura en su punto 3. Por ahora la
 * conexión usa el mismo usuario que el resto de servicios en local; el
 * aislamiento real hoy lo da `schema` + la revisión de código (Módulo 8),
 * no un GRANT de PostgreSQL. Si el equipo agrega esos roles más adelante,
 * aquí solo cambian DB_USERNAME y DB_PASSWORD del .env, no este archivo.
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
        schema: 'scheduling',
        entities: [AvailabilitySlot, Appointment, Rating, VetSchedule, VetBlock],
        synchronize: false,
        logging: process.env.NODE_ENV !== 'production',
      }),
    }),
  ],
})
export class DatabaseModule {}
