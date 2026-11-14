import { VetSchedule } from '../entities/vet-schedule.entity';
import { VetSchedulesRepository } from '../repositories/vet-schedules.repository';
import { DayBlocksService } from './day-blocks.service';

const VET = '55555555-5555-5555-5555-555555555551';
const MONDAY = '2026-11-09';

describe('DayBlocksService', () => {
  const findByVetAndDay = jest.fn();
  const findByVet = jest.fn();
  const service = new DayBlocksService({
    findByVetAndDay,
    findByVet,
  } as unknown as VetSchedulesRepository);
  const shift = (startTime: string, endTime: string, dayOfWeek = 1) =>
    ({ startTime, endTime, dayOfWeek }) as VetSchedule;

  beforeEach(() => {
    findByVetAndDay.mockReset();
    findByVet.mockReset();
  });

  it('divide los turnos del día según la duración, en instantes reales', async () => {
    findByVetAndDay.mockResolvedValue([shift('09:00', '10:00'), shift('14:00', '14:30')]);

    const blocks = await service.generate(VET, MONDAY, 30);

    expect(findByVetAndDay).toHaveBeenCalledWith(VET, 1);
    expect(blocks.map((block) => block.startTime.toISOString())).toEqual([
      '2026-11-09T12:00:00.000Z',
      '2026-11-09T12:30:00.000Z',
      '2026-11-09T17:00:00.000Z',
    ]);
    expect(blocks[0].endTime.toISOString()).toBe('2026-11-09T12:30:00.000Z');
  });

  it('descarta el resto del turno que no alcanza para un bloque completo', async () => {
    findByVetAndDay.mockResolvedValue([shift('09:00', '10:10')]);

    expect(await service.generate(VET, MONDAY, 30)).toHaveLength(2);
  });

  it('no genera bloques si el veterinario no atiende ese día', async () => {
    findByVetAndDay.mockResolvedValue([]);

    expect(await service.generate(VET, MONDAY, 30)).toEqual([]);
  });

  it('genera un rango respetando el día de cada turno y con una sola consulta', async () => {
    findByVet.mockResolvedValue([shift('09:00', '09:30', 1), shift('10:00', '10:30', 3)]);

    const blocks = await service.generateRange(VET, '2026-11-09', '2026-11-11', 30);

    expect(findByVet).toHaveBeenCalledTimes(1);
    expect(blocks.map((block) => block.startTime.toISOString())).toEqual([
      '2026-11-09T12:00:00.000Z',
      '2026-11-11T13:00:00.000Z',
    ]);
  });
});
