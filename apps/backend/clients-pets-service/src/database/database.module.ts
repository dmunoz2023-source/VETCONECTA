import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../modules/clients/entities/client.entity';
import { Pet } from '../modules/pets/entities/pet.entity';

/**
 * [A3] Conexión TypeORM aislada al esquema 'clients_pets'.
 *
 * Reglas de diseño (ver apps/backend/README.md):
 * - synchronize:false — el esquema real solo cambia vía infra/db/*.sql,
 *   nunca de forma automática por TypeORM.
 * - `schema` fija en la conexión: este servicio únicamente puede leer/
 *   escribir sobre `clients_pets`, nunca sobre tablas de otro dominio.
 * - No hay relaciones ni JOIN hacia esquemas ajenos. Cualquier referencia
 *   externa (por ejemplo el user_id de auth.users) se guarda como UUID
 *   plano y se valida vía HTTP contra rutas /internal del servicio dueño,
 *   no contra la base de datos directamente.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('databaseUrl'),
        schema: config.get<string>('dbSchema'),
        entities: [Client, Pet],
        synchronize: false,
        autoLoadEntities: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
