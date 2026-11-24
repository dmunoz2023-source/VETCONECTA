import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { SpecialtiesService } from '../../specialties/services/specialties.service';
import { VetsRepository } from '../repositories/vets.repository';
import { VetsService } from './vets.service';

const VET = '55555555-5555-5555-5555-555555555551';
const specialty = { id: 'e1', name: 'Vacunación', durationMinutes: 15, active: true };

describe('VetsService', () => {
  const repo = {
    findById: jest.fn(),
    findSpecialties: jest.fn(),
    hasSpecialty: jest.fn(),
    addSpecialty: jest.fn(),
    removeSpecialty: jest.fn(),
  };
  const specialties = { findById: jest.fn() };
  const service = new VetsService(
    repo as unknown as VetsRepository,
    specialties as unknown as SpecialtiesService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    repo.findById.mockResolvedValue({ userId: VET, active: true });
    repo.findSpecialties.mockResolvedValue([specialty]);
    repo.hasSpecialty.mockResolvedValue(false);
    specialties.findById.mockResolvedValue(specialty);
  });

  it('asigna una especialidad', async () => {
    await expect(service.assignSpecialty(VET, 'e1')).resolves.toEqual([specialty]);
    expect(repo.addSpecialty).toHaveBeenCalledWith(VET, 'e1');
  });

  it('rechaza con 404 un veterinario inexistente', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.assignSpecialty(VET, 'e1')).rejects.toThrow(NotFoundException);
  });

  it('rechaza con 409 una asignación repetida', async () => {
    repo.hasSpecialty.mockResolvedValue(true);

    await expect(service.assignSpecialty(VET, 'e1')).rejects.toThrow(ConflictException);
  });

  it('rechaza con 422 una especialidad desactivada', async () => {
    specialties.findById.mockResolvedValue({ ...specialty, active: false });

    await expect(service.assignSpecialty(VET, 'e1')).rejects.toThrow(UnprocessableEntityException);
  });

  it('responde 404 al quitar una especialidad que no tenía', async () => {
    repo.removeSpecialty.mockResolvedValue(false);

    await expect(service.unassignSpecialty(VET, 'e1')).rejects.toThrow(NotFoundException);
  });

  it('el resumen interno omite especialidades desactivadas', async () => {
    repo.findSpecialties.mockResolvedValue([specialty, { ...specialty, id: 'e2', active: false }]);

    await expect(service.getSummary(VET)).resolves.toEqual({
      userId: VET,
      active: true,
      specialties: [{ id: 'e1', name: 'Vacunación', durationMinutes: 15 }],
    });
  });
});
