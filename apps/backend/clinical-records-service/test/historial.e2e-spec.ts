import * as request from 'supertest';
import { createTestApp, TestContext } from './helpers/app';
import { resetDatabase, seedBulk, seedEvent } from './helpers/db';
import {
  asAdmin,
  asOwnerA,
  asReception,
  asVet,
  PET_A,
  PET_A2,
  PET_B,
  VET_ANA,
  VET_LUIS,
  VET_SIN_NOMBRE,
} from './helpers/fixtures';

const history = (petId: string) => `/v1/clinical/pets/${petId}/history`;

describe('Historial clínico por mascota [F3]', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  beforeEach(async () => {
    await resetDatabase(ctx.dataSource);
    ctx.appointments.appointments = [];
    ctx.appointments.lastCall = null;
  });

  async function seedFiveEventsForPetA() {
    await seedEvent(ctx.dataSource, { petId: PET_A, vetUserId: VET_ANA, type: 'consultation', date: '2026-03-10T10:00:00-03:00', weightKg: 12.5, temperatureC: 38.5, reason: 'Control general' });
    await seedEvent(ctx.dataSource, { petId: PET_A, vetUserId: VET_ANA, type: 'vaccine', date: '2026-05-20T11:30:00-03:00', reason: 'Vacuna anual', vaccine: { vaccine: 'Rabia', laboratory: 'LabVet', batch: 'L-0520', boosterDate: '2027-05-20' } });
    await seedEvent(ctx.dataSource, { petId: PET_A, vetUserId: VET_LUIS, type: 'checkup', date: '2026-07-02T09:00:00-03:00', reason: 'Control post-vacuna', nextCheckup: '2026-10-02' });
    await seedEvent(ctx.dataSource, { petId: PET_A, vetUserId: VET_ANA, type: 'consultation', date: '2026-09-15T16:00:00-03:00', reason: 'Cojera' });
    await seedEvent(ctx.dataSource, { petId: PET_A, vetUserId: VET_SIN_NOMBRE, type: 'vaccine', date: '2026-10-20T12:00:00-03:00', vaccine: { vaccine: 'Polivalente' } });
  }

  describe('contenido y orden', () => {
    it('devuelve los eventos del más reciente al más antiguo con los datos de cada uno', async () => {
      await seedFiveEventsForPetA();

      const res = await request(ctx.app.getHttpServer()).get(history(PET_A)).set(asVet).expect(200);

      expect(res.body.data.map((e: any) => e.date.slice(0, 10))).toEqual([
        '2026-10-20', '2026-09-15', '2026-07-02', '2026-05-20', '2026-03-10',
      ]);
      expect(res.body.meta).toEqual({ total: 5, page: 1, limit: 10, totalPages: 1 });

      const consulta = res.body.data[4];
      expect(consulta).toMatchObject({
        type: 'consultation',
        weightKg: 12.5,
        temperatureC: 38.5,
        reason: 'Control general',
        vaccination: null,
      });
    });

    it('incluye el detalle de la vacuna solo en los eventos de tipo vaccine (JOIN)', async () => {
      await seedFiveEventsForPetA();

      const res = await request(ctx.app.getHttpServer()).get(history(PET_A)).set(asVet).expect(200);
      const porTipo = (type: string) => res.body.data.filter((e: any) => e.type === type);

      expect(porTipo('vaccine').map((e: any) => e.vaccination.vaccine)).toEqual(['Polivalente', 'Rabia']);
      expect(porTipo('vaccine')[1].vaccination).toEqual({
        vaccine: 'Rabia', laboratory: 'LabVet', batch: 'L-0520', boosterDate: '2027-05-20',
      });
      expect(porTipo('consultation').every((e: any) => e.vaccination === null)).toBe(true);
    });

    it('trae el nombre del veterinario de cada evento, o null si el catálogo no lo conoce', async () => {
      await seedFiveEventsForPetA();

      const res = await request(ctx.app.getHttpServer()).get(history(PET_A)).set(asVet).expect(200);
      const vets = res.body.data.map((e: any) => e.vet);

      expect(vets).toContainEqual({ id: VET_ANA, name: 'Ana Pérez' });
      expect(vets).toContainEqual({ id: VET_LUIS, name: 'Luis Soto' });
      expect(vets).toContainEqual({ id: VET_SIN_NOMBRE, name: null });
    });

    it('no mezcla los eventos de otras mascotas', async () => {
      await seedFiveEventsForPetA();
      await seedEvent(ctx.dataSource, { petId: PET_B, vetUserId: VET_ANA, type: 'consultation', date: '2026-08-01T10:00:00-03:00' });

      const res = await request(ctx.app.getHttpServer()).get(history(PET_B)).set(asVet).expect(200);

      expect(res.body.meta.total).toBe(1);
    });

    it('una mascota sin eventos devuelve una lista vacía', async () => {
      const res = await request(ctx.app.getHttpServer()).get(history(PET_A2)).set(asVet).expect(200);

      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);
    });
  });

  describe('citas pasadas', () => {
    const cita = {
      id: 'c1c1c1c1-0000-4000-8000-000000000001',
      startTime: '2026-08-05T13:00:00.000Z',
      endTime: '2026-08-05T13:30:00.000Z',
      status: 'completed',
      vetUserId: VET_ANA,
      specialtyId: '44444444-4444-4444-4444-444444444441',
    };

    it('agrega las citas pasadas con su estado', async () => {
      ctx.appointments.appointments = [cita, { ...cita, id: 'c2c2c2c2-0000-4000-8000-000000000002', status: 'cancelled' }];

      const res = await request(ctx.app.getHttpServer()).get(history(PET_A)).set(asVet).expect(200);

      expect(res.body.appointmentsAvailable).toBe(true);
      expect(res.body.appointments.map((a: any) => a.status)).toEqual(['completed', 'cancelled']);
      expect(ctx.appointments.lastCall?.petId).toBe(PET_A);
    });

    it('si scheduling no responde, el historial sale igual y lo avisa con appointmentsAvailable=false', async () => {
      await seedFiveEventsForPetA();
      ctx.appointments.appointments = null;

      const res = await request(ctx.app.getHttpServer()).get(history(PET_A)).set(asVet).expect(200);

      expect(res.body.meta.total).toBe(5);
      expect(res.body.appointments).toEqual([]);
      expect(res.body.appointmentsAvailable).toBe(false);
    });
  });

  describe('filtros', () => {
    beforeEach(seedFiveEventsForPetA);

    it('por tipo de evento', async () => {
      const res = await request(ctx.app.getHttpServer()).get(`${history(PET_A)}?type=vaccine`).set(asVet).expect(200);

      expect(res.body.meta.total).toBe(2);
      expect(res.body.data.every((e: any) => e.type === 'vaccine')).toBe(true);
    });

    it('por rango de fechas (inclusive)', async () => {
      const res = await request(ctx.app.getHttpServer())
        .get(`${history(PET_A)}?from=2026-05-01&to=2026-09-30`)
        .set(asVet)
        .expect(200);

      expect(res.body.data.map((e: any) => e.date.slice(0, 10))).toEqual(['2026-09-15', '2026-07-02', '2026-05-20']);
    });

    it('un "to" sin hora incluye el día completo', async () => {
      const res = await request(ctx.app.getHttpServer()).get(`${history(PET_A)}?to=2026-10-20`).set(asVet).expect(200);

      expect(res.body.meta.total).toBe(5);
    });

    it('combina tipo y rango', async () => {
      const res = await request(ctx.app.getHttpServer())
        .get(`${history(PET_A)}?type=consultation&from=2026-06-01`)
        .set(asVet)
        .expect(200);

      expect(res.body.data.map((e: any) => e.date.slice(0, 10))).toEqual(['2026-09-15']);
    });

    it('el mismo rango acota las citas pasadas que se piden a scheduling', async () => {
      await request(ctx.app.getHttpServer()).get(`${history(PET_A)}?from=2026-05-01&to=2026-09-30`).set(asVet).expect(200);

      expect(ctx.appointments.lastCall?.range.from?.toISOString()).toBe('2026-05-01T00:00:00.000Z');
      expect(ctx.appointments.lastCall?.range.toExclusive?.toISOString()).toBe('2026-10-01T00:00:00.000Z');
    });
  });

  describe('paginación', () => {
    beforeEach(seedFiveEventsForPetA);

    it('recorre las páginas sin repetir ni saltarse eventos', async () => {
      const pages: string[] = [];
      for (const page of [1, 2, 3]) {
        const res = await request(ctx.app.getHttpServer()).get(`${history(PET_A)}?page=${page}&limit=2`).set(asVet).expect(200);
        expect(res.body.meta).toEqual({ total: 5, page, limit: 2, totalPages: 3 });
        pages.push(...res.body.data.map((e: any) => e.id));
      }

      expect(pages).toHaveLength(5);
      expect(new Set(pages).size).toBe(5);
    });

    it('una página fuera de rango devuelve la lista vacía', async () => {
      const res = await request(ctx.app.getHttpServer()).get(`${history(PET_A)}?page=9&limit=2`).set(asVet).expect(200);

      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(5);
    });
  });

  describe('validación de parámetros', () => {
    it.each([
      ['limit mayor a 50', '?limit=500'],
      ['limit en cero', '?limit=0'],
      ['page en cero', '?page=0'],
      ['page no numérico', '?page=abc'],
      ['tipo inexistente', '?type=otro'],
      ['fecha inválida', '?from=ayer'],
      ['rango invertido (from posterior a to)', '?from=2026-09-01&to=2026-05-01'],
      ['parámetro desconocido', '?color=rojo'],
    ])('%s responde 400', async (_nombre, query) => {
      await request(ctx.app.getHttpServer()).get(`${history(PET_A)}${query}`).set(asVet).expect(400);
    });

    it('un id de mascota que no es UUID responde 400', async () => {
      await request(ctx.app.getHttpServer()).get(history('abc')).set(asVet).expect(400);
    });
  });

  describe('permisos (BR-8, NFR-4)', () => {
    beforeEach(seedFiveEventsForPetA);

    it.each([
      ['veterinario', asVet],
      ['recepción', asReception],
      ['admin', asAdmin],
    ])('%s ve el historial de cualquier mascota', async (_rol, headers) => {
      const propia = await request(ctx.app.getHttpServer()).get(history(PET_A)).set(headers).expect(200);
      const ajena = await request(ctx.app.getHttpServer()).get(history(PET_B)).set(headers).expect(200);

      expect(propia.body.meta.total).toBe(5);
      expect(ajena.body.meta.total).toBe(0);
    });

    it('el dueño ve el historial de su mascota', async () => {
      const res = await request(ctx.app.getHttpServer()).get(history(PET_A)).set(asOwnerA).expect(200);

      expect(res.body.meta.total).toBe(5);
    });

    it('el dueño NO puede ver el historial de la mascota de otro cliente (403)', async () => {
      await seedEvent(ctx.dataSource, { petId: PET_B, vetUserId: VET_ANA, type: 'consultation', date: '2026-08-01T10:00:00-03:00' });

      const res = await request(ctx.app.getHttpServer()).get(history(PET_B)).set(asOwnerA).expect(403);

      expect(res.body.message).toContain('BR-8');
      expect(JSON.stringify(res.body)).not.toContain('consultation');
    });

    it('el dueño recibe 404 si la mascota no existe', async () => {
      await request(ctx.app.getHttpServer()).get(history('99999999-9999-4999-8999-999999999999')).set(asOwnerA).expect(404);
    });

    it('un dueño sin cliente asociado recibe 403', async () => {
      const { 'X-Client-Id': _omitido, ...sinCliente } = asOwnerA;

      await request(ctx.app.getHttpServer()).get(history(PET_A)).set(sinCliente).expect(403);
    });

    it('sin las cabeceras del Gateway responde 401', async () => {
      await request(ctx.app.getHttpServer()).get(history(PET_A)).expect(401);
    });
  });

  describe('rendimiento (NFR-1: menos de 2 s)', () => {
    const MASCOTA_CON_MUCHOS = PET_A;

    it('responde en menos de 2 s con 5.000 eventos de la mascota entre 55.000 en la tabla', async () => {
      await seedBulk(
        ctx.dataSource,
        { petId: MASCOTA_CON_MUCHOS, vetUserId: VET_ANA, petEvents: 5000 },
        { pets: 100, perPet: 500 },
      );

      const inicio = Date.now();
      const res = await request(ctx.app.getHttpServer())
        .get(`${history(MASCOTA_CON_MUCHOS)}?limit=50&page=3`)
        .set(asVet)
        .expect(200);
      const duracion = Date.now() - inicio;

      expect(res.body.meta.total).toBe(5000);
      expect(res.body.data).toHaveLength(50);
      expect(duracion).toBeLessThan(2000);
    });

    it('con filtros de tipo y fechas también responde en menos de 2 s', async () => {
      await seedBulk(
        ctx.dataSource,
        { petId: MASCOTA_CON_MUCHOS, vetUserId: VET_ANA, petEvents: 5000 },
        { pets: 100, perPet: 500 },
      );
      const desde = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString().slice(0, 10);

      const inicio = Date.now();
      const res = await request(ctx.app.getHttpServer())
        .get(`${history(MASCOTA_CON_MUCHOS)}?type=vaccine&from=${desde}&limit=50`)
        .set(asVet)
        .expect(200);

      expect(res.body.data.every((e: any) => e.type === 'vaccine')).toBe(true);
      expect(Date.now() - inicio).toBeLessThan(2000);
    });

    it('la consulta usa el índice (pet_id, date DESC) y no recorre toda la tabla', async () => {
      await seedBulk(
        ctx.dataSource,
        { petId: MASCOTA_CON_MUCHOS, vetUserId: VET_ANA, petEvents: 5000 },
        { pets: 100, perPet: 500 },
      );

      const plan: { 'QUERY PLAN': string }[] = await ctx.dataSource.query(
        `EXPLAIN SELECT * FROM clinical.clinical_events e
           LEFT JOIN clinical.vaccination_details v ON v.clinical_event_id = e.id
          WHERE e.pet_id = $1 ORDER BY e.date DESC, e.id DESC LIMIT 10`,
        [MASCOTA_CON_MUCHOS],
      );

      expect(plan.map((row) => row['QUERY PLAN']).join('\n')).toContain('idx_clinical_events_pet_date');
    });
  });
});
