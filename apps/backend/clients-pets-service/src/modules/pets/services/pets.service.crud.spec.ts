import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ClientsRepository } from '../../clients/repositories/clients.repository';
import { PetEntity } from '../entities/pet.entity';
import { PetsService } from './pets.service';

const CLIENT = '22222222-2222-2222-2222-222222222222';
const PET = '11111111-1111-1111-1111-111111111111';

describe('PetsService (servicio real) [F1]', () => {
  const petRepo = { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn() };
  const clientsRepo = { findById: jest.fn() };
  let service: PetsService;

  const pet = (over: object = {}) => ({
    id: PET,
    clientId: CLIENT,
    name: 'Firulais',
    birthDate: '2020-01-15',
    active: true,
    ...over,
  });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers({ now: new Date('2026-11-09T12:00:00Z'), doNotFake: ['nextTick'] });
    petRepo.create.mockImplementation((d) => ({ ...d }));
    petRepo.save.mockImplementation(async (d) => ({ id: PET, ...d }));
    clientsRepo.findById.mockResolvedValue({ id: CLIENT });
    service = new PetsService(
      petRepo as unknown as Repository<PetEntity>,
      clientsRepo as unknown as ClientsRepository,
    );
  });

  afterEach(() => jest.useRealTimers());

  describe('create', () => {
    const dto = { clientId: CLIENT, name: 'Firulais', birthDate: '2020-01-15' } as any;

    it('crea la mascota y calcula la edad al responder (BR-2)', async () => {
      const result = await service.create(dto);

      expect(petRepo.save).toHaveBeenCalled();
      expect(result.age).toEqual({ years: 6, months: 9, displayAge: '6 años y 9 meses' });
    });

    it('cliente inexistente -> 404', async () => {
      clientsRepo.findById.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(petRepo.save).not.toHaveBeenCalled();
    });

    it('fecha de nacimiento futura -> 400', async () => {
      await expect(service.create({ ...dto, birthDate: '2027-01-01' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('actualiza los campos enviados', async () => {
      petRepo.findOne.mockResolvedValue(pet());

      const result = await service.update(PET, { name: 'Max' } as any);

      expect(result.name).toBe('Max');
    });

    it('mascota inexistente -> 404', async () => {
      petRepo.findOne.mockResolvedValue(null);
      await expect(service.update(PET, {} as any)).rejects.toThrow(NotFoundException);
    });

    it('si cambia de cliente y el nuevo no existe -> 404', async () => {
      petRepo.findOne.mockResolvedValue(pet());
      clientsRepo.findById.mockResolvedValue(null);

      await expect(service.update(PET, { clientId: 'otro' } as any)).rejects.toThrow(NotFoundException);
    });

    it('si cambia de cliente y existe, lo permite', async () => {
      petRepo.findOne.mockResolvedValue(pet());

      await expect(service.update(PET, { clientId: 'otro' } as any)).resolves.toMatchObject({ clientId: 'otro' });
    });

    it('fecha de nacimiento futura -> 400', async () => {
      petRepo.findOne.mockResolvedValue(pet());
      await expect(service.update(PET, { birthDate: '2027-01-01' } as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('consultas', () => {
    it('findByClientId solo pide mascotas activas y agrega la edad (BR-9)', async () => {
      petRepo.find.mockResolvedValue([pet()]);

      const result = await service.findByClientId(CLIENT);

      expect(petRepo.find).toHaveBeenCalledWith({ where: { clientId: CLIENT, active: true }, order: { name: 'ASC' } });
      expect(result[0].age).toBeDefined();
    });

    it('findByPetId devuelve la mascota del cliente indicado (BR-8)', async () => {
      petRepo.findOne.mockResolvedValue(pet());

      await expect(service.findByPetId(CLIENT, PET)).resolves.toMatchObject({ id: PET });
      expect(petRepo.findOne).toHaveBeenCalledWith({ where: { id: PET, clientId: CLIENT, active: true } });
    });

    it('findByPetId -> 404 si no pertenece al cliente o esta inactiva', async () => {
      petRepo.findOne.mockResolvedValue(null);
      await expect(service.findByPetId(CLIENT, PET)).rejects.toThrow(NotFoundException);
    });

    it('findById devuelve la mascota activa o 404', async () => {
      petRepo.findOne.mockResolvedValueOnce(pet());
      await expect(service.findById(PET)).resolves.toMatchObject({ id: PET });

      petRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.findById(PET)).rejects.toThrow(NotFoundException);
    });

    it('findInternalById expone solo los datos minimos, incluso de mascotas inactivas', async () => {
      petRepo.findOne.mockResolvedValue(pet({ active: false, birthDate: 'x' }));

      await expect(service.findInternalById(PET)).resolves.toEqual({
        id: PET,
        clientId: CLIENT,
        name: 'Firulais',
        active: false,
      });
    });

    it('findInternalById -> 404 si no existe', async () => {
      petRepo.findOne.mockResolvedValue(null);
      await expect(service.findInternalById(PET)).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete (BR-9)', () => {
    it('marca la mascota como inactiva sin borrarla', async () => {
      const entity = pet();
      petRepo.findOne.mockResolvedValue(entity);

      const result = await service.softDelete(PET);

      expect(petRepo.save).toHaveBeenCalledWith(expect.objectContaining({ active: false }));
      expect(result.message).toContain(PET);
    });

    it('mascota inexistente -> 404', async () => {
      petRepo.findOne.mockResolvedValue(null);
      await expect(service.softDelete(PET)).rejects.toThrow(NotFoundException);
    });
  });
});
