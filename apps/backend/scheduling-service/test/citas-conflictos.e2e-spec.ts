import * as request from 'supertest';
import { TestContext, createTestApp } from './helpers/app';
import { countActiveAppointments, countAllActive, resetDatabase, seedSlot } from './helpers/db';
import {
  OWNER_1,
  OWNER_2,
  PET_OWNER_1,
  PET_OWNER_2,
  SPECIALTY_CONSULTA,
  VET_A,
  VET_B,
  asOwner,
  asReception,
  citaBody,
  futureUtc,
} from './helpers/fixtures';

/**
 * [J2] Casos borde de la reserva de citas (BR-5). Cada caso documenta su
 * resultado esperado; la tabla completa esta en test/README.md.
 */
describe('Conflictos de horario en citas [J2]', () => {
  let ctx: TestContext;

  const book = (headers: Record<string, string>, body: ReturnType<typeof citaBody>) =>
    request(ctx.app.getHttpServer()).post('/v1/citas').set(headers).send(body);

  const cancel = (headers: Record<string, string>, appointmentId: string) =>
    request(ctx.app.getHttpServer()).patch(`/v1/citas/${appointmentId}/cancelar`).set(headers);

  const bodyFor = (petId: string, vetUserId: string, start: Date, specialtyId = SPECIALTY_CONSULTA) =>
    citaBody({ petId, vetUserId, specialtyId, startTime: start.toISOString() });

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  beforeEach(async () => {
    await resetDatabase(ctx.dataSource);
    ctx.pets.add(PET_OWNER_1);
    ctx.pets.add(PET_OWNER_2);
    ctx.reminders.scheduled.length = 0;
    ctx.reminders.cancelled.length = 0;
  });

  describe('misma hora', () => {
    it('mismo veterinario: la segunda reserva recibe 409 y solo queda una cita activa', async () => {
      const start = futureUtc(3, 13);
      await seedSlot(ctx.dataSource, { vetUserId: VET_A, specialtyId: SPECIALTY_CONSULTA, start, minutes: 30 });

      const first = await book(asOwner(OWNER_1), bodyFor(PET_OWNER_1.id, VET_A, start));
      const second = await book(asOwner(OWNER_2), bodyFor(PET_OWNER_2.id, VET_A, start));

      expect(first.status).toBe(201);
      expect(second.status).toBe(409);
      expect(second.body.message).toBe('Horario ya reservado');
      expect(await countActiveAppointments(ctx.dataSource, VET_A, start)).toBe(1);
    });

    it('otro veterinario: las dos reservas se aceptan', async () => {
      const start = futureUtc(3, 13);
      await seedSlot(ctx.dataSource, { vetUserId: VET_A, specialtyId: SPECIALTY_CONSULTA, start, minutes: 30 });
      await seedSlot(ctx.dataSource, { vetUserId: VET_B, specialtyId: SPECIALTY_CONSULTA, start, minutes: 30 });

      const withA = await book(asOwner(OWNER_1), bodyFor(PET_OWNER_1.id, VET_A, start));
      const withB = await book(asOwner(OWNER_2), bodyFor(PET_OWNER_2.id, VET_B, start));

      expect(withA.status).toBe(201);
      expect(withB.status).toBe(201);
    });
  });

  describe('cita cancelada', () => {
    it('el horario queda libre: otra persona puede reservarlo y la cancelada se conserva', async () => {
      const start = futureUtc(3, 14);
      await seedSlot(ctx.dataSource, { vetUserId: VET_A, specialtyId: SPECIALTY_CONSULTA, start, minutes: 30 });

      const first = await book(asOwner(OWNER_1), bodyFor(PET_OWNER_1.id, VET_A, start));
      expect(first.status).toBe(201);

      const cancelled = await cancel(asOwner(OWNER_1), first.body.id);
      expect(cancelled.status).toBe(200);
      expect(cancelled.body.status).toBe('cancelled');
      expect(ctx.reminders.cancelled).toContain(first.body.id);

      const second = await book(asOwner(OWNER_2), bodyFor(PET_OWNER_2.id, VET_A, start));
      expect(second.status).toBe(201);
      expect(second.body.id).not.toBe(first.body.id);

      const rows = await ctx.dataSource.query(
        'SELECT status FROM scheduling.appointments ORDER BY status',
      );
      expect(rows.map((row: { status: string }) => row.status)).toEqual(['booked', 'cancelled']);
    });
  });

  describe('hora no reservable', () => {
    it('hora pasada: 400', async () => {
      const past = futureUtc(-1, 13);
      await seedSlot(ctx.dataSource, { vetUserId: VET_A, specialtyId: SPECIALTY_CONSULTA, start: past, minutes: 30 });

      const response = await book(asOwner(OWNER_1), bodyFor(PET_OWNER_1.id, VET_A, past));

      expect(response.status).toBe(400);
      expect(await countActiveAppointments(ctx.dataSource, VET_A, past)).toBe(0);
    });

    it('fuera del horario del veterinario: 404', async () => {
      const start = futureUtc(3, 13);
      await seedSlot(ctx.dataSource, { vetUserId: VET_A, specialtyId: SPECIALTY_CONSULTA, start, minutes: 30 });

      const sinBloque = await book(asOwner(OWNER_1), bodyFor(PET_OWNER_1.id, VET_A, futureUtc(3, 9)));
      const aMitadDeBloque = await book(asOwner(OWNER_1), bodyFor(PET_OWNER_1.id, VET_A, futureUtc(3, 13, 15)));
      const otraEspecialidad = await book(
        asOwner(OWNER_1),
        bodyFor(PET_OWNER_1.id, VET_A, start, 'dddddddd-0000-4000-8000-000000000099'),
      );

      expect(sinBloque.status).toBe(404);
      expect(aMitadDeBloque.status).toBe(404);
      expect(otraEspecialidad.status).toBe(404);
      expect(await countActiveAppointments(ctx.dataSource, VET_A, start)).toBe(0);
    });

    it('sobre un bloqueo: 404', async () => {
      const start = futureUtc(3, 15);
      await seedSlot(ctx.dataSource, {
        vetUserId: VET_A,
        specialtyId: SPECIALTY_CONSULTA,
        start,
        minutes: 30,
        status: 'blocked',
      });

      const response = await book(asOwner(OWNER_1), bodyFor(PET_OWNER_1.id, VET_A, start));

      expect(response.status).toBe(404);
      expect(await countActiveAppointments(ctx.dataSource, VET_A, start)).toBe(0);
    });
  });

  describe('validaciones de entrada', () => {
    it('sin zona horaria: 400', async () => {
      const response = await book(asOwner(OWNER_1), {
        ...bodyFor(PET_OWNER_1.id, VET_A, futureUtc(3, 13)),
        startTime: '2030-01-01T10:00:00',
      });

      expect(response.status).toBe(400);
    });

    it('recepcion reserva para cualquier mascota; un dueño no puede reservar para la de otro (403)', async () => {
      const start = futureUtc(3, 16);
      await seedSlot(ctx.dataSource, { vetUserId: VET_A, specialtyId: SPECIALTY_CONSULTA, start, minutes: 30 });

      const ajena = await book(asOwner(OWNER_1), bodyFor(PET_OWNER_2.id, VET_A, start));
      const porRecepcion = await book(asReception(), bodyFor(PET_OWNER_2.id, VET_A, start));

      expect(ajena.status).toBe(403);
      expect(porRecepcion.status).toBe(201);
    });
  });

  describe('reservas simultaneas', () => {
    it('20 reservas al mismo bloque con Promise.all: solo una gana y el resto recibe 409', async () => {
      const start = futureUtc(4, 13);
      await seedSlot(ctx.dataSource, { vetUserId: VET_A, specialtyId: SPECIALTY_CONSULTA, start, minutes: 30 });

      const responses = await Promise.all(
        Array.from({ length: 20 }, (_, index) =>
          index % 2 === 0
            ? book(asOwner(OWNER_1), bodyFor(PET_OWNER_1.id, VET_A, start))
            : book(asOwner(OWNER_2), bodyFor(PET_OWNER_2.id, VET_A, start)),
        ),
      );

      const statuses = responses.map((response) => response.status);
      expect(statuses.filter((status) => status === 201)).toHaveLength(1);
      expect(statuses.filter((status) => status === 409)).toHaveLength(19);
      expect(await countActiveAppointments(ctx.dataSource, VET_A, start)).toBe(1);

      const audited = await ctx.dataSource.query(
        "SELECT count(*)::int AS total FROM scheduling.audit_log WHERE action = 'appointment.created'",
      );
      expect(audited[0].total).toBe(1);
      expect(ctx.reminders.scheduled).toHaveLength(1);
    });

    it('repetido en 5 bloques distintos: nunca quedan dos citas activas en el mismo bloque', async () => {
      const starts = [13, 14, 15, 16, 17].map((hour) => futureUtc(4, hour));
      for (const start of starts) {
        await seedSlot(ctx.dataSource, { vetUserId: VET_A, specialtyId: SPECIALTY_CONSULTA, start, minutes: 30 });
      }

      const responses = await Promise.all(
        starts.flatMap((start) =>
          Array.from({ length: 8 }, () => book(asOwner(OWNER_1), bodyFor(PET_OWNER_1.id, VET_A, start))),
        ),
      );

      expect(responses.filter((response) => response.status === 201)).toHaveLength(5);
      expect(responses.filter((response) => response.status === 409)).toHaveLength(35);
      for (const start of starts) {
        expect(await countActiveAppointments(ctx.dataSource, VET_A, start)).toBe(1);
      }
    });

    it('mismo horario con dos veterinarios a la vez: gana una reserva por cada veterinario', async () => {
      const start = futureUtc(4, 18);
      await seedSlot(ctx.dataSource, { vetUserId: VET_A, specialtyId: SPECIALTY_CONSULTA, start, minutes: 30 });
      await seedSlot(ctx.dataSource, { vetUserId: VET_B, specialtyId: SPECIALTY_CONSULTA, start, minutes: 30 });

      const responses = await Promise.all(
        [VET_A, VET_B, VET_A, VET_B, VET_A, VET_B].map((vet) =>
          book(asOwner(OWNER_1), bodyFor(PET_OWNER_1.id, vet, start)),
        ),
      );

      expect(responses.filter((response) => response.status === 201)).toHaveLength(2);
      expect(responses.filter((response) => response.status === 409)).toHaveLength(4);
      expect(await countActiveAppointments(ctx.dataSource, VET_A, start)).toBe(1);
      expect(await countActiveAppointments(ctx.dataSource, VET_B, start)).toBe(1);
    });

    it('cancelaciones simultaneas de la misma cita: una recibe 200 y las demas 409', async () => {
      const start = futureUtc(4, 19);
      await seedSlot(ctx.dataSource, { vetUserId: VET_A, specialtyId: SPECIALTY_CONSULTA, start, minutes: 30 });
      const created = await book(asOwner(OWNER_1), bodyFor(PET_OWNER_1.id, VET_A, start));
      expect(created.status).toBe(201);

      const responses = await Promise.all(
        Array.from({ length: 5 }, () => cancel(asOwner(OWNER_1), created.body.id)),
      );

      expect(responses.filter((response) => response.status === 200)).toHaveLength(1);
      expect(responses.filter((response) => response.status === 409)).toHaveLength(4);
      expect(await countAllActive(ctx.dataSource, VET_A)).toBe(0);
    });
  });
});
