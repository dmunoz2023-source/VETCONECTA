import { ValidationPipe, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { PetsLookup } from '../../src/modules/appointments/clients/pets.lookup';
import { RemindersClient } from '../../src/modules/appointments/clients/reminders.client';
import { PetOwnerCheck } from '../../src/modules/ratings/clients/pet-owner.check';
import { FakePetOwnerCheck, FakePetsLookup, FakeRemindersClient } from './fakes';

export interface TestContext {
  app: INestApplication;
  dataSource: DataSource;
  pets: FakePetsLookup;
  reminders: FakeRemindersClient;
  petOwner: FakePetOwnerCheck;
}

/**
 * Levanta scheduling-service completo (controladores, guards, TypeORM y la base
 * de prueba). Solo se sustituyen los servicios externos: clients-pets (mascotas y dueño)
 * y notifications.
 * Usa la misma ValidationPipe global que main.ts.
 */
export async function createTestApp(): Promise<TestContext> {
  const pets = new FakePetsLookup();
  const reminders = new FakeRemindersClient();
  const petOwner = new FakePetOwnerCheck();

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PetsLookup)
    .useValue(pets)
    .overrideProvider(RemindersClient)
    .useValue(reminders)
    .overrideProvider(PetOwnerCheck)
    .useValue(petOwner)
    .compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  await app.init();
  // Un solo servidor escuchando: supertest no abre uno nuevo por cada peticion simultanea.
  await app.listen(0);

  return { app, dataSource: app.get(DataSource), pets, reminders, petOwner };
}
