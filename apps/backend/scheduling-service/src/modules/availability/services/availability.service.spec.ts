import {
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AppointmentsRepository } from '../../appointments/repositories/appointments.repository';
import { CatalogClient } from '../../schedules/clients/catalog.client';
import { VetBlocksRepository } from '../../schedules/repositories/vet-blocks.repository';
import { DayBlocksService } from '../../schedules/services/day-blocks.service';
import { AvailabilityService } from './availability.service';

const VET = '55555555-5555-5555-5555-555555555551';
const SPECIALTY = '44444444-4444-4444-4444-444444444441';
const query = { vetId: VET, specialtyId: SPECIALTY, from: '2026-11-09', to: '2026-11-09' };
const block = (start: string, end: string) => ({
  startTime: new Date(start),
  endTime: new Date(end),
});

describe('AvailabilityService', () => {
  const catalog = { findVet: jest.fn() };
  const dayBlocks = { generateRange: jest.fn() };
  const appointments = { findActiveByVetBetween: jest.fn() };
  const vetBlocks = { findByVet: jest.fn() };
  const service = new AvailabilityService(
    catalog as unknown as CatalogClient,
    dayBlocks as unknown as DayBlocksService,
    appointments as unknown as AppointmentsRepository,
    vetBlocks as unknown as VetBlocksRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ now: new Date('2026-11-05T12:00:00Z'), doNotFake: ['nextTick'] });
    catalog.findVet.mockResolvedValue({
      userId: VET,
      active: true,
      specialties: [{ id: SPECIALTY, name: 'General', durationMinutes: 30 }],
    });
    dayBlocks.generateRange.mockResolvedValue([
      block('2026-11-09T12:00:00Z', '2026-11-09T12:30:00Z'),
      block('2026-11-09T12:30:00Z', '2026-11-09T13:00:00Z'),
      block('2026-11-09T13:00:00Z', '2026-11-09T13:30:00Z'),
    ]);
    appointments.findActiveByVetBetween.mockResolvedValue([]);
    vetBlocks.findByVet.mockResolvedValue([]);
  });

  afterEach(() => jest.useRealTimers());

  const starts = async (input = query) =>
    (await service.findFreeBlocks(input)).map((free) => free.startTime);

  it('devuelve los bloques con el desfase de la clínica y usa la duración de la especialidad', async () => {
    await expect(service.findFreeBlocks(query)).resolves.toContainEqual({
      startTime: '2026-11-09T09:00:00-03:00',
      endTime: '2026-11-09T09:30:00-03:00',
    });
    expect(dayBlocks.generateRange).toHaveBeenCalledWith(VET, '2026-11-09', '2026-11-09', 30);
  });

  it('una hora reservada deja de aparecer', async () => {
    appointments.findActiveByVetBetween.mockResolvedValue([
      block('2026-11-09T12:30:00Z', '2026-11-09T13:00:00Z'),
    ]);

    await expect(starts()).resolves.toEqual([
      '2026-11-09T09:00:00-03:00',
      '2026-11-09T10:00:00-03:00',
    ]);
  });

  it('una cita de otra duración quita todos los bloques con los que se cruza', async () => {
    appointments.findActiveByVetBetween.mockResolvedValue([
      block('2026-11-09T12:15:00Z', '2026-11-09T12:45:00Z'),
    ]);

    await expect(starts()).resolves.toEqual(['2026-11-09T10:00:00-03:00']);
  });

  it('descuenta los bloqueos por horas', async () => {
    vetBlocks.findByVet.mockResolvedValue([
      { date: '2026-11-09', startTime: '09:00', endTime: '09:30' },
    ]);

    await expect(starts()).resolves.toEqual([
      '2026-11-09T09:30:00-03:00',
      '2026-11-09T10:00:00-03:00',
    ]);
  });

  it('un bloqueo de día completo deja el día sin bloques', async () => {
    vetBlocks.findByVet.mockResolvedValue([{ date: '2026-11-09', startTime: null, endTime: null }]);

    await expect(starts()).resolves.toEqual([]);
  });

  it('quita las horas ya pasadas, incluida la que ya empezó', async () => {
    jest.setSystemTime(new Date('2026-11-09T12:10:00Z'));

    await expect(starts()).resolves.toEqual([
      '2026-11-09T09:30:00-03:00',
      '2026-11-09T10:00:00-03:00',
    ]);
  });

  it('acepta un rango de 30 días y rechaza uno de 31', async () => {
    await expect(service.findFreeBlocks({ ...query, to: '2026-12-08' })).resolves.toBeDefined();
    await expect(service.findFreeBlocks({ ...query, to: '2026-12-09' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rechaza con 400 un rango invertido', async () => {
    await expect(service.findFreeBlocks({ ...query, to: '2026-11-08' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rechaza con 404 un veterinario inexistente', async () => {
    catalog.findVet.mockResolvedValue(null);

    await expect(service.findFreeBlocks(query)).rejects.toThrow(NotFoundException);
  });

  it('rechaza con 422 si no atiende la especialidad (BR-4)', async () => {
    catalog.findVet.mockResolvedValue({ userId: VET, active: true, specialties: [] });

    await expect(service.findFreeBlocks(query)).rejects.toThrow(UnprocessableEntityException);
  });

  it('rechaza con 422 si el veterinario está inactivo', async () => {
    catalog.findVet.mockResolvedValue({
      userId: VET,
      active: false,
      specialties: [{ id: SPECIALTY, name: 'General', durationMinutes: 30 }],
    });

    await expect(service.findFreeBlocks(query)).rejects.toThrow(UnprocessableEntityException);
  });
});
