import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { AppointmentsClient } from '../../src/modules/history/clients/appointments.client';
import { ClientsPetsClient } from '../../src/modules/clinical/clients/clients-pets.client';
import { VetsLookup } from '../../src/modules/history/clients/vets.lookup';
import { FakeAppointmentsClient, FakeClientsPetsClient, FakeVetsLookup } from './fakes';
import { CLIENT_OF_USER, PETS, VET_NAMES } from './fixtures';

export interface TestContext {
  app: INestApplication;
  dataSource: DataSource;
  appointments: FakeAppointmentsClient;
  clientsPets: FakeClientsPetsClient;
}

/**
 * Levanta la aplicación completa (controlador, guards, servicio, TypeORM y PostgreSQL real).
 * Solo se sustituyen los servicios externos: mascotas, veterinarios y citas.
 */
export async function createTestApp(): Promise<TestContext> {
  const appointments = new FakeAppointmentsClient();
  const clientsPets = new FakeClientsPetsClient(PETS, CLIENT_OF_USER);

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(ClientsPetsClient)
    .useValue(clientsPets)
    .overrideProvider(VetsLookup)
    .useValue(new FakeVetsLookup(VET_NAMES))
    .overrideProvider(AppointmentsClient)
    .useValue(appointments)
    .compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.init();

  return { app, dataSource: app.get(DataSource), appointments, clientsPets };
}
