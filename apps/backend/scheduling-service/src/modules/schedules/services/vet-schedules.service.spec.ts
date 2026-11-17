import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CatalogClient } from '../clients/catalog.client';
import { VetSchedulesRepository } from '../repositories/vet-schedules.repository';
import { VetSchedulesService } from './vet-schedules.service';

const VET = '55555555-5555-5555-5555-555555555551';
const morning = { id: 's1', vetUserId: VET, dayOfWeek: 1, startTime: '09:00', endTime: '13:00' };

describe('VetSchedulesService', () => {
  const repo = {
    findByVetAndDay: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn((schedule) => Promise.resolve(schedule)),
    remove: jest.fn(),
  };
  const catalog = { findVet: jest.fn() };
  const service = new VetSchedulesService(
    repo as unknown as VetSchedulesRepository,
    catalog as unknown as CatalogClient,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    catalog.findVet.mockResolvedValue({ userId: VET, active: true, specialties: [] });
    repo.findByVetAndDay.mockResolvedValue([morning]);
  });

  it('crea un turno que no se solapa', async () => {
    const dto = { dayOfWeek: 1, startTime: '14:00', endTime: '18:00' };

    await expect(service.create(VET, dto)).resolves.toEqual({ ...dto, vetUserId: VET });
  });

  it('permite un turno que empieza justo cuando termina otro', async () => {
    const dto = { dayOfWeek: 1, startTime: '13:00', endTime: '15:00' };

    await expect(service.create(VET, dto)).resolves.toBeDefined();
  });

  it.each([
    ['cruza el inicio', '08:00', '10:00'],
    ['cruza el fin', '12:00', '14:00'],
    ['queda dentro', '10:00', '11:00'],
    ['contiene al turno', '08:00', '14:00'],
  ])('rechaza con 409 un turno que %s', async (_, startTime, endTime) => {
    await expect(service.create(VET, { dayOfWeek: 1, startTime, endTime })).rejects.toThrow(
      ConflictException,
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it.each([
    ['menor', '10:00', '09:00'],
    ['igual', '10:00', '10:00'],
  ])('rechaza con 400 una hora de fin %s a la de inicio', async (_, startTime, endTime) => {
    await expect(service.create(VET, { dayOfWeek: 2, startTime, endTime })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rechaza con 404 un veterinario inexistente', async () => {
    catalog.findVet.mockResolvedValue(null);

    await expect(
      service.create(VET, { dayOfWeek: 1, startTime: '14:00', endTime: '18:00' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rechaza con 422 un veterinario inactivo', async () => {
    catalog.findVet.mockResolvedValue({ userId: VET, active: false, specialties: [] });

    await expect(
      service.create(VET, { dayOfWeek: 1, startTime: '14:00', endTime: '18:00' }),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('al editar no choca consigo mismo', async () => {
    repo.findOne.mockResolvedValue(morning);

    await expect(service.update(VET, 's1', { endTime: '12:00' })).resolves.toMatchObject({
      startTime: '09:00',
      endTime: '12:00',
    });
  });

  it('al editar valida contra la combinación con los datos guardados', async () => {
    repo.findOne.mockResolvedValue(morning);

    await expect(service.update(VET, 's1', { endTime: '08:00' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('no permite tocar un turno de otro veterinario', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.remove(VET, 'otro')).rejects.toThrow(NotFoundException);
    expect(repo.remove).not.toHaveBeenCalled();
  });
});
