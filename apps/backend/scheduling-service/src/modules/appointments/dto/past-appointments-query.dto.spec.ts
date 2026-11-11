import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PastAppointmentsQueryDto } from './past-appointments-query.dto';

const PET_ID = '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90';

async function errorsFor(plain: Record<string, unknown>): Promise<string[]> {
  const errors = await validate(plainToInstance(PastAppointmentsQueryDto, plain));
  return errors.map((e) => e.property);
}

describe('PastAppointmentsQueryDto [F3]', () => {
  it('acepta solo petId', async () => {
    expect(await errorsFor({ petId: PET_ID })).toEqual([]);
  });

  it('acepta petId con un rango ISO 8601 con zona horaria', async () => {
    expect(
      await errorsFor({ petId: PET_ID, from: '2026-10-01T00:00:00Z', to: '2026-11-01T00:00:00-03:00' }),
    ).toEqual([]);
  });

  it('rechaza si falta petId', async () => {
    expect(await errorsFor({})).toContain('petId');
  });

  it('rechaza un petId que no es UUID', async () => {
    expect(await errorsFor({ petId: 'no-es-un-uuid' })).toContain('petId');
  });

  it('rechaza fechas que no son ISO 8601', async () => {
    const errors = await errorsFor({ petId: PET_ID, from: 'ayer', to: '32/13/2026' });
    expect(errors).toEqual(expect.arrayContaining(['from', 'to']));
  });
});
