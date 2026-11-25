import * as request from 'supertest';
import { TestContext, createTestApp } from './helpers/app';
import { ratingsOf, resetDatabase, seedAppointment, seedRating } from './helpers/db';
import {
  OWNER_1,
  OWNER_2,
  PET_OWNER_1,
  PET_OWNER_2,
  SPECIALTY_CONSULTA,
  VET_A,
  VET_B,
  asAdmin,
  asOwner,
  asReception,
  asVet,
  futureUtc,
} from './helpers/fixtures';

/**
 * [K2] Calificaciones de citas (FR-12, BR-13) de punta a punta: HTTP → guards → servicio →
 * PostgreSQL real. Solo se sustituye la verificación de dueño en clients-pets.
 * La tabla de casos está en test/README.md.
 */
describe('Calificaciones de citas [K2]', () => {
  let ctx: TestContext;

  const server = () => ctx.app.getHttpServer();
  const rate = (headers: Record<string, string>, appointmentId: string, body: object) =>
    request(server()).post(`/v1/scheduling/appointments/${appointmentId}/rating`).set(headers).send(body);
  const list = (headers: Record<string, string>, query = '') =>
    request(server()).get(`/v1/scheduling/ratings${query}`).set(headers);
  const summary = (headers: Record<string, string>, query = '') =>
    request(server()).get(`/v1/scheduling/ratings/summary${query}`).set(headers);

  /** Cita de OWNER_1 con la mascota PET_OWNER_1; por defecto ya realizada. */
  const seedCompleted = (
    overrides: Partial<Parameters<typeof seedAppointment>[1]> = {},
  ): Promise<string> =>
    seedAppointment(ctx.dataSource, {
      petId: PET_OWNER_1.id,
      clientId: OWNER_1.clientId,
      vetUserId: VET_A,
      specialtyId: SPECIALTY_CONSULTA,
      start: futureUtc(-3, 14),
      status: 'completed',
      ...overrides,
    });

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  beforeEach(async () => {
    await resetDatabase(ctx.dataSource);
    ctx.petOwner.unavailable = false;
    ctx.petOwner.add(PET_OWNER_1.id, OWNER_1.userId);
    ctx.petOwner.add(PET_OWNER_2.id, OWNER_2.userId);
  });

  describe('POST /v1/scheduling/appointments/:id/rating', () => {
    it('201: el dueño califica su cita realizada y queda guardada', async () => {
      const id = await seedCompleted();

      const res = await rate(asOwner(OWNER_1), id, { stars: 5, comment: 'Excelente atención' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ appointmentId: id, stars: 5, comment: 'Excelente atención' });
      expect(res.body.id).toEqual(expect.any(String));
      expect(res.body.createdAt).toEqual(expect.any(String));
      expect(res.body).not.toHaveProperty('clientId');
      expect(await ratingsOf(ctx.dataSource, id)).toEqual([
        { stars: 5, comment: 'Excelente atención', client_id: OWNER_1.clientId },
      ]);
    });

    it('201: el comentario es opcional y se guarda como null', async () => {
      const id = await seedCompleted();

      const res = await rate(asOwner(OWNER_1), id, { stars: 3 });

      expect(res.status).toBe(201);
      expect(res.body.comment).toBeNull();
    });

    it('201: un comentario de exactamente 500 caracteres se acepta', async () => {
      const id = await seedCompleted();

      const res = await rate(asOwner(OWNER_1), id, { stars: 4, comment: 'a'.repeat(500) });

      expect(res.status).toBe(201);
    });

    it('409: una segunda calificación de la misma cita se rechaza y no cambia la primera', async () => {
      const id = await seedCompleted();
      await rate(asOwner(OWNER_1), id, { stars: 5, comment: 'Primera' });

      const res = await rate(asOwner(OWNER_1), id, { stars: 1, comment: 'Segunda' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('RATING_ALREADY_EXISTS');
      expect(await ratingsOf(ctx.dataSource, id)).toEqual([
        { stars: 5, comment: 'Primera', client_id: OWNER_1.clientId },
      ]);
    });

    it('409: con 5 peticiones simultáneas solo una se registra', async () => {
      const id = await seedCompleted();

      const results = await Promise.all(
        [1, 2, 3, 4, 5].map((stars) => rate(asOwner(OWNER_1), id, { stars })),
      );

      const statuses = results.map((r) => r.status).sort();
      expect(statuses).toEqual([201, 409, 409, 409, 409]);
      expect(await ratingsOf(ctx.dataSource, id)).toHaveLength(1);
    });

    it.each(['booked', 'confirmed', 'cancelled', 'no_show'] as const)(
      '422: una cita en estado %s no se puede calificar',
      async (status) => {
        const id = await seedCompleted({ status, start: futureUtc(2, 10) });

        const res = await rate(asOwner(OWNER_1), id, { stars: 5 });

        expect(res.status).toBe(422);
        expect(res.body.error).toBe('APPOINTMENT_NOT_COMPLETED');
        expect(await ratingsOf(ctx.dataSource, id)).toHaveLength(0);
      },
    );

    it('403: un dueño no puede calificar la cita de otro', async () => {
      const id = await seedCompleted();

      const res = await rate(asOwner(OWNER_2), id, { stars: 1 });

      expect(res.status).toBe(403);
      expect(await ratingsOf(ctx.dataSource, id)).toHaveLength(0);
    });

    it('403: antes de revelar el estado, una cita ajena no realizada también responde 403', async () => {
      const id = await seedCompleted({ status: 'booked', start: futureUtc(2, 10) });

      const res = await rate(asOwner(OWNER_2), id, { stars: 1 });

      expect(res.status).toBe(403);
    });

    it.each([
      ['recepción', asReception()],
      ['administrador', asAdmin()],
      ['veterinario', asVet(VET_A)],
    ])('403: el rol %s no puede calificar', async (_name, headers) => {
      const id = await seedCompleted();

      const res = await rate(headers, id, { stars: 5 });

      expect(res.status).toBe(403);
      expect(await ratingsOf(ctx.dataSource, id)).toHaveLength(0);
    });

    it('404: la cita no existe', async () => {
      const res = await rate(asOwner(OWNER_1), 'cccccccc-1111-4000-8000-000000000099', { stars: 5 });

      expect(res.status).toBe(404);
    });

    it('401: sin las cabeceras del Gateway', async () => {
      const id = await seedCompleted();

      const res = await request(server()).post(`/v1/scheduling/appointments/${id}/rating`).send({ stars: 5 });

      expect(res.status).toBe(401);
    });

    it('400: el id de la cita no es un UUID', async () => {
      const res = await rate(asOwner(OWNER_1), 'no-es-uuid', { stars: 5 });

      expect(res.status).toBe(400);
    });

    it.each([
      ['0 estrellas', { stars: 0 }],
      ['6 estrellas', { stars: 6 }],
      ['estrellas decimales', { stars: 3.5 }],
      ['estrellas como texto', { stars: 'cinco' }],
      ['sin estrellas', { comment: 'hola' }],
      ['comentario de 501 caracteres', { stars: 4, comment: 'a'.repeat(501) }],
      ['campos que no existen (clientId)', { stars: 4, clientId: OWNER_2.clientId }],
    ])('400: %s', async (_name, body) => {
      const id = await seedCompleted();

      const res = await rate(asOwner(OWNER_1), id, body);

      expect(res.status).toBe(400);
      expect(await ratingsOf(ctx.dataSource, id)).toHaveLength(0);
    });

    it('503: si clients-pets no responde no se registra nada', async () => {
      const id = await seedCompleted();
      ctx.petOwner.unavailable = true;

      const res = await rate(asOwner(OWNER_1), id, { stars: 5 });

      expect(res.status).toBe(503);
      expect(await ratingsOf(ctx.dataSource, id)).toHaveLength(0);
    });
  });

  describe("campo 'rated' en GET /v1/scheduling/appointments/me", () => {
    it('es true en las citas calificadas y false en el resto', async () => {
      const rated = await seedCompleted({ start: futureUtc(-5, 10) });
      const notRated = await seedCompleted({ start: futureUtc(-4, 10) });
      const booked = await seedCompleted({ status: 'booked', start: futureUtc(3, 10) });
      await rate(asOwner(OWNER_1), rated, { stars: 4 });

      const res = await request(server()).get('/v1/scheduling/appointments/me').set(asOwner(OWNER_1));

      expect(res.status).toBe(200);
      const byId = new Map<string, { rated: boolean }>(res.body.data.map((a: { id: string; rated: boolean }) => [a.id, a]));
      expect(byId.get(rated)?.rated).toBe(true);
      expect(byId.get(notRated)?.rated).toBe(false);
      expect(byId.get(booked)?.rated).toBe(false);
      expect(res.body.meta.total).toBe(3);
    });

    it('un dueño sin citas recibe una lista vacía', async () => {
      const res = await request(server()).get('/v1/scheduling/appointments/me').set(asOwner(OWNER_2));

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('la calificación de otro dueño no marca mis citas', async () => {
      const mine = await seedCompleted({ start: futureUtc(-6, 10) });
      const theirs = await seedCompleted({
        petId: PET_OWNER_2.id,
        clientId: OWNER_2.clientId,
        start: futureUtc(-6, 11),
      });
      await rate(asOwner(OWNER_2), theirs, { stars: 5 });

      const res = await request(server()).get('/v1/scheduling/appointments/me').set(asOwner(OWNER_1));

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toMatchObject({ id: mine, rated: false });
    });
  });

  describe('listado y resumen', () => {
    // Cinco calificaciones: dos veterinarios, fechas repartidas y un caso en el último segundo de noviembre.
    const dataset = [
      { vet: VET_A, stars: 5, comment: 'Excelente', at: '2026-11-10T12:00:00Z' },
      { vet: VET_A, stars: 4, comment: null, at: '2026-11-15T09:00:00Z' },
      { vet: VET_B, stars: 2, comment: 'Demoró mucho', at: '2026-11-20T18:00:00Z' },
      { vet: VET_B, stars: 5, comment: null, at: '2026-11-30T23:30:00Z' },
      { vet: VET_A, stars: 3, comment: 'Normal', at: '2026-12-02T10:00:00Z' },
    ];

    beforeEach(async () => {
      let day = 0;
      for (const row of dataset) {
        day += 1;
        const id = await seedCompleted({ vetUserId: row.vet, start: futureUtc(-30 - day, 10) });
        await seedRating(ctx.dataSource, {
          appointmentId: id,
          clientId: OWNER_1.clientId,
          stars: row.stars,
          comment: row.comment,
          createdAt: new Date(row.at),
        });
      }
    });

    describe('GET /v1/scheduling/ratings', () => {
      it.each([
        ['recepción', asReception()],
        ['administrador', asAdmin()],
        ['veterinario', asVet(VET_A)],
      ])('200: el rol %s puede consultar', async (_name, headers) => {
        const res = await list(headers);

        expect(res.status).toBe(200);
        expect(res.body.meta.total).toBe(5);
      });

      it('403: un dueño no puede consultar las calificaciones', async () => {
        expect((await list(asOwner(OWNER_1))).status).toBe(403);
      });

      it('401: sin las cabeceras del Gateway', async () => {
        expect((await request(server()).get('/v1/scheduling/ratings')).status).toBe(401);
      });

      it('ordena de la más reciente a la más antigua e incluye el veterinario', async () => {
        const res = await list(asAdmin());

        expect(res.body.data.map((r: { stars: number }) => r.stars)).toEqual([3, 5, 2, 4, 5]);
        expect(res.body.data[0]).toEqual(
          expect.objectContaining({
            appointmentId: expect.any(String),
            stars: 3,
            comment: 'Normal',
            vetUserId: VET_A,
            createdAt: '2026-12-02T10:00:00.000Z',
            appointmentStartTime: expect.any(String),
          }),
        );
        expect(res.body.data[0]).not.toHaveProperty('clientId');
      });

      it('pagina con page y limit', async () => {
        const second = await list(asAdmin(), '?page=2&limit=2');

        expect(second.body.meta).toEqual({ total: 5, page: 2, limit: 2, totalPages: 3 });
        expect(second.body.data.map((r: { stars: number }) => r.stars)).toEqual([2, 4]);

        const last = await list(asAdmin(), '?page=3&limit=2');
        expect(last.body.data).toHaveLength(1);
      });

      it('filtra por veterinario', async () => {
        const res = await list(asAdmin(), `?vetUserId=${VET_B}`);

        expect(res.body.meta.total).toBe(2);
        expect(res.body.data.every((r: { vetUserId: string }) => r.vetUserId === VET_B)).toBe(true);
      });

      it('filtra por rango de fechas; un "to" sin hora incluye todo ese día', async () => {
        const res = await list(asAdmin(), '?from=2026-11-15&to=2026-11-30');

        expect(res.body.data.map((r: { stars: number }) => r.stars)).toEqual([5, 2, 4]);
      });

      it('combina veterinario y fechas', async () => {
        const res = await list(asAdmin(), `?vetUserId=${VET_A}&from=2026-11-01&to=2026-11-30`);

        expect(res.body.data.map((r: { stars: number }) => r.stars)).toEqual([4, 5]);
      });

      it('sin coincidencias devuelve una lista vacía', async () => {
        const res = await list(asAdmin(), '?from=2027-01-01');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
        expect(res.body.meta.total).toBe(0);
      });

      it.each([
        ['from posterior a to', '?from=2026-12-01&to=2026-11-01'],
        ['fecha inválida', '?from=ayer'],
        ['vetUserId que no es UUID', '?vetUserId=abc'],
        ['limit mayor a 50', '?limit=51'],
        ['page cero', '?page=0'],
        ['parámetro desconocido', '?orden=asc'],
      ])('400: %s', async (_name, query) => {
        expect((await list(asAdmin(), query)).status).toBe(400);
      });
    });

    describe('GET /v1/scheduling/ratings/summary', () => {
      it('promedio y distribución coinciden con los datos guardados', async () => {
        const res = await summary(asAdmin());

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          average: 3.8,
          total: 5,
          distribution: { '1': 0, '2': 1, '3': 1, '4': 1, '5': 2 },
        });

        // Se contrasta con la base de datos, no solo con los valores sembrados.
        const [db] = await ctx.dataSource.query(
          `SELECT AVG(stars)::float AS average, COUNT(*)::int AS total FROM scheduling.ratings`,
        );
        expect(res.body.average).toBeCloseTo(db.average, 2);
        expect(res.body.total).toBe(db.total);
      });

      it('filtra por veterinario', async () => {
        const res = await summary(asAdmin(), `?vetUserId=${VET_A}`);

        expect(res.body).toEqual({
          average: 4,
          total: 3,
          distribution: { '1': 0, '2': 0, '3': 1, '4': 1, '5': 1 },
        });
      });

      it('filtra por fechas con los mismos límites que el listado', async () => {
        const res = await summary(asAdmin(), '?from=2026-11-01&to=2026-11-30');

        expect(res.body).toEqual({
          average: 4,
          total: 4,
          distribution: { '1': 0, '2': 1, '3': 0, '4': 1, '5': 2 },
        });
      });

      it('sin calificaciones el promedio es null', async () => {
        const res = await summary(asAdmin(), '?from=2027-01-01');

        expect(res.body).toEqual({
          average: null,
          total: 0,
          distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        });
      });

      it('redondea el promedio a 2 decimales', async () => {
        const res = await summary(asAdmin(), `?vetUserId=${VET_B}&to=2026-11-20`);
        expect(res.body.average).toBe(2);

        const id = await seedCompleted({ vetUserId: VET_B, start: futureUtc(-60, 10) });
        await seedRating(ctx.dataSource, {
          appointmentId: id,
          clientId: OWNER_1.clientId,
          stars: 4,
          createdAt: new Date('2026-11-21T10:00:00Z'),
        });
        // VET_B: 2, 5 y 4 → 11 / 3 = 3.666…
        expect((await summary(asAdmin(), `?vetUserId=${VET_B}`)).body.average).toBe(3.67);
      });

      it.each([
        ['recepción', asReception()],
        ['veterinario', asVet(VET_A)],
        ['dueño', asOwner(OWNER_1)],
      ])('403: el rol %s no puede ver el resumen', async (_name, headers) => {
        expect((await summary(headers)).status).toBe(403);
      });

      it('401: sin las cabeceras del Gateway', async () => {
        expect((await request(server()).get('/v1/scheduling/ratings/summary')).status).toBe(401);
      });

      it('400: filtros inválidos', async () => {
        expect((await summary(asAdmin(), '?from=2026-12-01&to=2026-11-01')).status).toBe(400);
        expect((await summary(asAdmin(), '?vetUserId=abc')).status).toBe(400);
      });
    });
  });
});
