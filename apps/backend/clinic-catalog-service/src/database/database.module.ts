import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clinic } from '../modules/clinic/entities/clinic.entity';
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
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        schema: 'catalog',
        entities: [Clinic, Specialty, Vet, VetSpecialty],
        synchronize: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
