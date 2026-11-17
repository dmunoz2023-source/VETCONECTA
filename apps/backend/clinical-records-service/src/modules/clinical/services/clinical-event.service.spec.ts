import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { ClientsPetsClient } from '../clients/clients-pets.client';
import {
  ClinicalEventType,
  CreateClinicalEventDto,
} from '../dto/create-clinical-event.dto';
import { ClinicalEventRepository } from '../repositories/clinical-event.repository';
import { ClinicalEventService } from './clinical-event.service';

const PET_ID = '11111111-1111-4111-8111-111111111111';
const VET_ID = '55555555-5555-4555-8555-555555555551';
const OTHER_VET_ID = '55555555-5555-4555-8555-555555555552';
const OWNER_ID = '33333333-3333-4333-8333-333333333331';

const owner: JwtPayload = { sub: OWNER_ID, email: 'o@vet.cl', role: 'owner', clientId: 'c1' };
const vet: JwtPayload = { sub: VET_ID, email: 'v@vet.cl', role: 'vet' };
const otherVet: JwtPayload = { sub: OTHER_VET_ID, email: 'v2@vet.cl', role: 'vet' };
const admin: JwtPayload = { sub: 'adm-1', email: 'a@vet.cl', role: 'admin' };
const reception: JwtPayload = { sub: 'r1', email: 'r@vet.cl', role: 'reception' };

// Consultation/checkup
const consultation = (over: Partial<CreateClinicalEventDto> = {}): CreateClinicalEventDto =>
  ({
    petId: PET_ID,
    type: ClinicalEventType.CONSULTATION,
    date: '2026-11-01T10:00:00.000Z',
    weightKg: 12.5,
    notes: 'Control general sin novedades',
    diagnosis: 'Sano',
    nextCheckup: '2026-12-01',
    ...over,
  }) as CreateClinicalEventDto;

  
const vaccine = (over: Partial<CreateClinicalEventDto> = {}): CreateClinicalEventDto =>
  ({
    petId: PET_ID,
    type: ClinicalEventType.VACCINE,
    date: '2026-11-01T10:00:00.000Z',
    weightKg: 10,
    notes: 'Sin reacciones',
    vaccineName: 'Rabia',
    batch: 'L-123',
    boosterDate: '2027-11-01',
    ...over,
  }) as CreateClinicalEventDto;

describe('ClinicalEventService [F2]', () => {
  const repo = {
    save: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    findByPetId: jest.fn(),
    findHistoryByPetId: jest.fn(),
  };
  const petsClient = {
    assertPetExists: jest.fn(),
    assertPetOwnership: jest.fn(),
  };
  let service: ClinicalEventService;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers({ now: new Date('2026-11-09T12:00:00Z'), doNotFake: ['nextTick'] });
    petsClient.assertPetExists.mockResolvedValue(undefined);
    petsClient.assertPetOwnership.mockResolvedValue(undefined);
    repo.save.mockImplementation(async (data, actor, vaccination) => ({ id: 'e1', ...data, vaccination }));
    service = new ClinicalEventService(
      repo as unknown as ClinicalEventRepository,
      petsClient as unknown as ClientsPetsClient,
    );
  });

  afterEach(() => jest.useRealTimers());

  describe('create', () => {
    it('consulta: verifica la mascota, toma el veterinario del JWT y guarda sin datos de vacuna', async () => {
      const result = await service.create(consultation({ temperatureC: 38.5, reason: 'Chequeo' }), VET_ID);

      expect(petsClient.assertPetExists).toHaveBeenCalledWith(PET_ID);
      expect(repo.save).toHaveBeenCalledWith(
        {
          petId: PET_ID,
          type: ClinicalEventType.CONSULTATION,
          date: new Date('2026-11-01T10:00:00.000Z'),
          weightKg: 12.5,
          temperatureC: 38.5,
          reason: 'Chequeo',
          diagnosis: 'Sano',
          notes: 'Control general sin novedades',
          nextCheckup: '2026-12-01',
          veterinarianId: VET_ID,
        },
        VET_ID,
        undefined,
      );
      expect(result.veterinarianId).toBe(VET_ID);
    });

    it('guarda null en temperatura y motivo cuando no vienen', async () => {
      await service.create(consultation(), VET_ID);

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ temperatureC: null, reason: null }),
        VET_ID,
        undefined,
      );
    });

    it('vacuna: guarda el evento junto con nombre, lote y fecha de refuerzo', async () => {
      await service.create(vaccine(), VET_ID);

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ClinicalEventType.VACCINE,
          diagnosis: null,
          nextCheckup: null,
          veterinarianId: VET_ID,
        }),
        VET_ID,
        { vaccine: 'Rabia', batch: 'L-123', boosterDate: '2027-11-01' },
      );
    });

    it('mascota inexistente -> 404 y no se guarda nada', async () => {
      petsClient.assertPetExists.mockRejectedValue(new NotFoundException());

      await expect(service.create(consultation(), VET_ID)).rejects.toThrow(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('rechaza una fecha futura con 400 y no guarda', async () => {
      await expect(service.create(consultation({ date: '2026-11-10T12:00:00Z' }), VET_ID)).rejects.toThrow(
        BadRequestException,
      );
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('acepta un evento de hoy (no es futuro)', async () => {
      await expect(service.create(consultation({ date: '2026-11-09T11:59:00Z' }), VET_ID)).resolves.toBeDefined();
    });

    it.each([
      ['sin nombre de vacuna', { vaccineName: undefined }],
      ['sin lote', { batch: undefined }],
      ['sin fecha de proxima dosis', { boosterDate: undefined }],
      ['con diagnostico', { diagnosis: 'Sano' }],
      ['con proximo control', { nextCheckup: '2026-12-01' }],
    ])('vacuna %s -> 400', async (_case, change) => {
      await expect(service.create(vaccine(change as any), VET_ID)).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it.each([
      ['sin diagnostico', { diagnosis: undefined }],
      ['sin proximo control', { nextCheckup: undefined }],
      ['con nombre de vacuna', { vaccineName: 'Rabia' }],
      ['con lote', { batch: 'L-1' }],
      ['con fecha de proxima dosis', { boosterDate: '2027-01-01' }],
    ])('consulta %s -> 400', async (_case, change) => {
      await expect(service.create(consultation(change as any), VET_ID)).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('tambien valida las reglas de un control (no solo de consulta)', async () => {
      await expect(
        service.create(consultation({ type: ClinicalEventType.CHECKUP, diagnosis: undefined }), VET_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('propaga el error si el repositorio falla', async () => {
      repo.save.mockRejectedValue(new Error('db caida'));
      await expect(service.create(consultation(), VET_ID)).rejects.toThrow('db caida');
    });
  });

  describe('update', () => {
    const existing = (over: object = {}) => ({ id: 'e1', petId: PET_ID, veterinarianId: VET_ID, ...over });

    it('el veterinario autor edita su evento', async () => {
      repo.findById.mockResolvedValue(existing());
      repo.update.mockResolvedValue({ id: 'e1', notes: 'editado' });

      const result = await service.update('e1', consultation({ notes: 'editado' }), vet);

      expect(repo.update).toHaveBeenCalledWith(
        'e1',
        expect.objectContaining({ petId: PET_ID, notes: 'editado' }),
        VET_ID,
        undefined,
      );
      expect(result).toEqual({ id: 'e1', notes: 'editado' });
    });

    it('un administrador puede editar el evento de otro veterinario', async () => {
      repo.findById.mockResolvedValue(existing());
      repo.update.mockResolvedValue({ id: 'e1' });

      await expect(service.update('e1', consultation(), admin)).resolves.toEqual({ id: 'e1' });
      expect(repo.update).toHaveBeenCalledWith('e1', expect.any(Object), 'adm-1', undefined);
    });

    it('editar una vacuna envia los datos de vacuna al repositorio', async () => {
      repo.findById.mockResolvedValue(existing());
      repo.update.mockResolvedValue({ id: 'e1' });

      await service.update('e1', vaccine(), vet);

      expect(repo.update).toHaveBeenCalledWith('e1', expect.any(Object), VET_ID, {
        vaccine: 'Rabia',
        batch: 'L-123',
        boosterDate: '2027-11-01',
      });
    });

    it('evento inexistente -> 404', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('x', consultation(), vet)).rejects.toThrow(NotFoundException);
    });

    it('otro veterinario (no autor ni admin) -> 403 y no se modifica', async () => {
      repo.findById.mockResolvedValue(existing());

      await expect(service.update('e1', consultation(), otherVet)).rejects.toThrow(ForbiddenException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('no permite cambiar la mascota del evento -> 400', async () => {
      repo.findById.mockResolvedValue(existing({ petId: 'otra-mascota' }));

      await expect(service.update('e1', consultation(), vet)).rejects.toThrow(BadRequestException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('aplica las mismas validaciones que al crear (fecha futura -> 400)', async () => {
      repo.findById.mockResolvedValue(existing());

      await expect(service.update('e1', consultation({ date: '2026-11-10T12:00:00Z' }), vet)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('si el repositorio no encuentra el evento al actualizar -> 404', async () => {
      repo.findById.mockResolvedValue(existing());
      repo.update.mockResolvedValue(null);

      await expect(service.update('e1', consultation(), vet)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByPetId (carnet)', () => {
    it.each([
      ['veterinario', vet],
      ['recepcion', reception],
      ['administrador', admin],
    ])('%s ve el carnet sin verificar propiedad', async (_role, user) => {
      repo.findByPetId.mockResolvedValue([{ id: 'e1' }]);

      await expect(service.findByPetId(PET_ID, user)).resolves.toEqual([{ id: 'e1' }]);
      expect(petsClient.assertPetOwnership).not.toHaveBeenCalled();
    });

    it('el dueño ve el carnet de su mascota (se verifica la propiedad)', async () => {
      repo.findByPetId.mockResolvedValue([{ id: 'e1' }]);

      await expect(service.findByPetId(PET_ID, owner)).resolves.toEqual([{ id: 'e1' }]);
      expect(petsClient.assertPetOwnership).toHaveBeenCalledWith(PET_ID, OWNER_ID);
    });

    it('un dueño ajeno recibe 403 (BR-8) y no se leen eventos', async () => {
      petsClient.assertPetOwnership.mockRejectedValue(new ForbiddenException());

      await expect(service.findByPetId(PET_ID, owner)).rejects.toThrow(ForbiddenException);
      expect(repo.findByPetId).not.toHaveBeenCalled();
    });
  });

  describe('findHistoryByPetId', () => {
    it('devuelve los datos con la meta de paginacion calculada', async () => {
      repo.findHistoryByPetId.mockResolvedValue([[{ id: 'e1' }, { id: 'e2' }], 25]);

      const result = await service.findHistoryByPetId(PET_ID, { page: 2, limit: 10 });

      expect(repo.findHistoryByPetId).toHaveBeenCalledWith(PET_ID, 2, 10);
      expect(result).toEqual({
        data: [{ id: 'e1' }, { id: 'e2' }],
        meta: { total: 25, page: 2, limit: 10, totalPages: 3 },
      });
    });

    it('con historial vacio devuelve totalPages 0', async () => {
      repo.findHistoryByPetId.mockResolvedValue([[], 0]);

      const result = await service.findHistoryByPetId(PET_ID, { page: 1, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.meta.totalPages).toBe(0);
    });
  });
});
