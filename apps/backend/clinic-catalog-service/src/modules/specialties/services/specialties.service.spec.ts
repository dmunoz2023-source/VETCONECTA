import { ConflictException, NotFoundException } from '@nestjs/common';
import { SpecialtiesRepository } from '../repositories/specialties.repository';
import { SpecialtiesService } from './specialties.service';

const existing = { id: 'e1', name: 'Vacunación', durationMinutes: 15, active: true };

describe('SpecialtiesService', () => {
  const repo = {
    findById: jest.fn(),
    findByName: jest.fn(),
    save: jest.fn((specialty) => Promise.resolve(specialty)),
  };
  const service = new SpecialtiesService(repo as unknown as SpecialtiesRepository);

  beforeEach(() => {
    jest.clearAllMocks();
    repo.findById.mockResolvedValue(existing);
    repo.findByName.mockResolvedValue(null);
  });

  it('crea una especialidad nueva', async () => {
    const dto = { name: 'Cirugía', durationMinutes: 60 };

    await expect(service.create(dto)).resolves.toEqual(dto);
  });

  it('rechaza con 409 un nombre repetido', async () => {
    repo.findByName.mockResolvedValue(existing);

    await expect(service.create({ name: 'Vacunación', durationMinutes: 15 })).rejects.toThrow(
      ConflictException,
    );
  });

  it('permite editar sin cambiar el nombre', async () => {
    await expect(service.update('e1', { name: 'Vacunación', durationMinutes: 20 })).resolves.toMatchObject({
      durationMinutes: 20,
    });
    expect(repo.findByName).not.toHaveBeenCalled();
  });

  it('responde 404 si la especialidad no existe', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.findById('nope')).rejects.toThrow(NotFoundException);
  });

  it('desactiva con baja lógica', async () => {
    await service.deactivate('e1');

    expect(repo.save).toHaveBeenCalledWith({ ...existing, active: false });
  });
});
