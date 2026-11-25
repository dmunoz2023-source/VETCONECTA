import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateRatingDto } from './create-rating.dto';
import { GetRatingsQueryDto } from './get-ratings-query.dto';

async function errorsFor<T extends object>(cls: new () => T, plain: Record<string, unknown>) {
  const instance = plainToInstance(cls, plain);
  const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
  return { instance, properties: errors.map((e) => e.property) };
}

describe('CreateRatingDto [K2]', () => {
  it.each([1, 2, 3, 4, 5])('acepta %i estrellas', async (stars) => {
    expect((await errorsFor(CreateRatingDto, { stars })).properties).toEqual([]);
  });

  it.each([0, 6, -1, 3.5, '4', null])('rechaza stars = %p', async (stars) => {
    expect((await errorsFor(CreateRatingDto, { stars })).properties).toContain('stars');
  });

  it('rechaza si falta stars', async () => {
    expect((await errorsFor(CreateRatingDto, { comment: 'hola' })).properties).toContain('stars');
  });

  it('acepta un comentario de exactamente 500 caracteres', async () => {
    const { properties } = await errorsFor(CreateRatingDto, { stars: 4, comment: 'a'.repeat(500) });
    expect(properties).toEqual([]);
  });

  it('rechaza un comentario de 501 caracteres', async () => {
    const { properties } = await errorsFor(CreateRatingDto, { stars: 4, comment: 'a'.repeat(501) });
    expect(properties).toContain('comment');
  });

  it('el comentario se recorta y uno en blanco se ignora', async () => {
    expect((await errorsFor(CreateRatingDto, { stars: 4, comment: '  Gracias  ' })).instance.comment).toBe('Gracias');
    const blank = await errorsFor(CreateRatingDto, { stars: 4, comment: '    ' });
    expect(blank.instance.comment).toBeUndefined();
    expect(blank.properties).toEqual([]);
  });

  it('rechaza un comentario que no es texto', async () => {
    expect((await errorsFor(CreateRatingDto, { stars: 4, comment: 123 })).properties).toContain('comment');
  });

  it('rechaza propiedades desconocidas (no se puede enviar clientId ni appointmentId)', async () => {
    const { properties } = await errorsFor(CreateRatingDto, { stars: 4, clientId: 'x' });
    expect(properties).toContain('clientId');
  });
});

describe('GetRatingsQueryDto [K2]', () => {
  const VET = '55555555-5555-5555-5555-5555555555a1';

  it('usa page 1 y limit 10 por defecto', async () => {
    const { instance, properties } = await errorsFor(GetRatingsQueryDto, {});
    expect(properties).toEqual([]);
    expect(instance.page).toBe(1);
    expect(instance.limit).toBe(10);
  });

  it('convierte page y limit desde el query string', async () => {
    const { instance, properties } = await errorsFor(GetRatingsQueryDto, { page: '2', limit: '50' });
    expect(properties).toEqual([]);
    expect(instance).toMatchObject({ page: 2, limit: 50 });
  });

  it('acepta veterinario y rango de fechas', async () => {
    const { properties } = await errorsFor(GetRatingsQueryDto, {
      vetUserId: VET,
      from: '2026-11-01',
      to: '2026-11-30T23:59:59Z',
    });
    expect(properties).toEqual([]);
  });

  it.each([
    ['vetUserId', 'no-es-uuid'],
    ['from', 'ayer'],
    ['to', '30/11/2026'],
    ['page', '0'],
    ['limit', '51'],
    ['limit', '0'],
  ])('rechaza %s = %s', async (field, value) => {
    expect((await errorsFor(GetRatingsQueryDto, { [field]: value })).properties).toContain(field);
  });
});
