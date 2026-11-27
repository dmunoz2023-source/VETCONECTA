import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AppointmentsRepository } from '../../appointments/repositories/appointments.repository';
import { CatalogClient } from '../clients/catalog.client';
import { VetBlocksRepository } from '../repositories/vet-blocks.repository';
import { VetBlocksService } from './vet-blocks.service';

const VET = '55555555-5555-5555-5555-555555555551';
const USER = '55555555-5555-5555-5555-555555555552';

describe('VetBlocksService', () => {
  const repo = {
    findOne: jest.fn(),
    save: jest.fn((block) => Promise.resolve(block)),
    remove: jest.fn(),
  };
  const appointments = { findActiveByVetBetween: jest.fn() };
  const catalog = { findVet: jest.fn() };
  const service = new VetBlocksService(
    repo as unknown as VetBlocksRepository,
    appointments as unknown as AppointmentsRepository,
    catalog as unknown as CatalogClient,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    catalog.findVet.mockResolvedValue({ userId: VET, active: true, specialties: [] });
    appointments.findActiveByVetBetween.mockResolvedValue([]);
  });

  it('crea el bloqueo y devuelve las citas afectadas como advertencia', async () => {
    const start = new Date('2026-11-09T12:00:00.000Z');
    const end = new Date('2026-11-09T12:30:00.000Z');
    appointments.findActiveByVetBetween.mockResolvedValue([
      { id: 'c1', petId: 'p1', clientId: 'k1', startTime: start, endTime: end, status: 'booked', slot: {} },
    ]);

    const result = await service.create(
      VET,
      { date: '2026-11-09', startTime: '09:00', endTime: '13:00', reason: 'training' },
      USER,
    );

    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ vetUserId: VET, createdBy: USER }));
    expect(appointments.findActiveByVetBetween).toHaveBeenCalledWith(
      VET,
      new Date('2026-11-09T12:00:00.000Z'),
      new Date('2026-11-09T16:00:00.000Z'),
    );
    expect(result.affectedAppointments).toEqual([
      { id: 'c1', petId: 'p1', clientId: 'k1', startTime: start, endTime: end, status: 'booked' },
    ]);
  });

  it('sin horas revisa el día completo en hora de la clínica', async () => {
    await service.create(VET, { date: '2026-12-25', reason: 'holiday' }, USER);

    expect(appointments.findActiveByVetBetween).toHaveBeenCalledWith(
      VET,
      new Date('2026-12-25T03:00:00.000Z'),
      new Date('2026-12-26T03:00:00.000Z'),
    );
  });

  it.each([
    ['solo inicio', { startTime: '09:00' }],
    ['solo fin', { endTime: '09:00' }],
    ['fin antes del inicio', { startTime: '10:00', endTime: '09:00' }],
  ])('rechaza con 400 un rango inválido: %s', async (_, range) => {
    await expect(
      service.create(VET, { date: '2026-12-25', reason: 'holiday', ...range }, USER),
    ).rejects.toThrow(BadRequestException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('rechaza con 404 un veterinario inexistente', async () => {
    catalog.findVet.mockResolvedValue(null);

    await expect(service.create(VET, { date: '2026-12-25', reason: 'holiday' }, USER)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('al editar puede pasar de rango horario a día completo', async () => {
    repo.findOne.mockResolvedValue({
      id: 'b1',
      vetUserId: VET,
      date: '2026-12-25',
      startTime: '09:00',
      endTime: '10:00',
      reason: 'holiday',
    });

    const result = await service.update(VET, 'b1', { startTime: null, endTime: null });

    expect(result.block).toMatchObject({ startTime: null, endTime: null });
  });

  it('rechaza con 400 el motivo other sin notes', async () => {
    await expect(service.create(VET, { date: '2026-12-25', reason: 'other' }, USER)).rejects.toThrow(
      BadRequestException,
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('acepta el motivo other con notes', async () => {
    await service.create(VET, { date: '2026-12-25', reason: 'other', notes: 'Corte de luz' }, USER);

    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ reason: 'other', notes: 'Corte de luz' }));
  });

  it('al editar a other exige notes', async () => {
    repo.findOne.mockResolvedValue({ id: 'b1', vetUserId: VET, date: '2026-12-25', reason: 'holiday', notes: null });

    await expect(service.update(VET, 'b1', { reason: 'other' })).rejects.toThrow(BadRequestException);
  });

  it('no permite borrar un bloqueo de otro veterinario', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.remove(VET, 'otro')).rejects.toThrow(NotFoundException);
    expect(repo.remove).not.toHaveBeenCalled();
  });
});
