import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { ClinicalEventRepository } from '../repositories/clinical-event.repository';
import {
  ClinicalEventType,
  CreateClinicalEventDto,
} from '../dto/create-clinical-event.dto';
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

// Consulta/control: exige diagnostico y proximoControl, no acepta datos de vacuna.
const consulta = (over: Partial<CreateClinicalEventDto> = {}): CreateClinicalEventDto => ({
  mascotaId: PET_ID,
  tipo: ClinicalEventType.CONSULTA,
  fecha: '2026-11-01T10:00:00.000Z',
  peso: 12.5,
  observaciones: 'Control general sin novedades',
  diagnostico: 'Sano',
  proximoControl: '2026-12-01',
  ...over,
} as CreateClinicalEventDto);

// Vacuna: exige nombre, lote y fecha de proxima dosis, no acepta diagnostico ni proximoControl.
const vacuna = (over: Partial<CreateClinicalEventDto> = {}): CreateClinicalEventDto => ({
  mascotaId: PET_ID,
  tipo: ClinicalEventType.VACUNA,
  fecha: '2026-11-01T10:00:00.000Z',
  peso: 10,
  observaciones: 'Sin reacciones',
  nombreVacuna: 'Rabia',
  lote: 'L-123',
  fechaProximaDosis: '2027-11-01',
  ...over,
} as CreateClinicalEventDto);

describe('ClinicalEventService [F2]', () => {
  const repo = {
    save: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    findByPetId: jest.fn(),
    findHistoryByPetId: jest.fn(),
  };
  let service: ClinicalEventService;
  const originalEnv = { ...process.env };
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers({ now: new Date('2026-11-09T12:00:00Z'), doNotFake: ['nextTick'] });
    process.env = { ...originalEnv, INTERNAL_API_KEY: 'k-test', CLIENTS_SERVICE_URL: 'http://clients:3002/' };
    (global as any).fetch = fetchMock;
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
    repo.save.mockImplementation(async (data, vaccination) => ({ id: 'e1', ...data, vaccination }));
    service = new ClinicalEventService(repo as unknown as ClinicalEventRepository);
  });

  afterEach(() => {
    jest.useRealTimers();
    process.env = originalEnv;
  });

  describe('create', () => {
    it('consulta: verifica la mascota, toma el veterinario del JWT y guarda sin datos de vacuna', async () => {
      const result = await service.create(consulta({ temperatura: 38.5, motivo: 'Chequeo' }), VET_ID);

      expect(fetchMock).toHaveBeenCalledWith(`http://clients:3002/internal/pets/${PET_ID}`, {
        headers: { 'X-Internal-Key': 'k-test' },
      });
      expect(repo.save).toHaveBeenCalledWith(
        {
          petId: PET_ID,
          type: ClinicalEventType.CONSULTA,
          date: new Date('2026-11-01T10:00:00.000Z'),
          weightKg: 12.5,
          temperatureC: 38.5,
          reason: 'Chequeo',
          diagnosis: 'Sano',
          notes: 'Control general sin novedades',
          nextCheckup: '2026-12-01',
          veterinarianId: VET_ID,
        },
        undefined,
      );
      expect(result.veterinarianId).toBe(VET_ID);
    });

    it('guarda null en los campos opcionales que no vienen', async () => {
      await service.create(consulta({ peso: undefined }), VET_ID);

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ weightKg: null, temperatureC: null, reason: null }),
        undefined,
      );
    });

    it('vacuna: guarda el evento junto con nombre, lote y fecha de refuerzo', async () => {
      await service.create(vacuna(), VET_ID);

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ClinicalEventType.VACUNA,
          diagnosis: null,
          nextCheckup: null,
          veterinarianId: VET_ID,
        }),
        { vaccine: 'Rabia', batch: 'L-123', boosterDate: '2027-11-01' },
      );
    });

    it('mascota inexistente -> 404 y no se guarda nada', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 404 });

      await expect(service.create(consulta(), VET_ID)).rejects.toThrow(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('servicio de clientes con error -> 503', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 500 });
      await expect(service.create(consulta(), VET_ID)).rejects.toThrow(ServiceUnavailableException);
    });

    it('sin conexion al servicio de clientes -> 503', async () => {
      fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
      await expect(service.create(consulta(), VET_ID)).rejects.toThrow(ServiceUnavailableException);
    });

    it('sin clave interna configurada -> 500 y no se consulta', async () => {
      delete process.env.INTERNAL_API_KEY;
      delete process.env.INTERNAL_KEY;

      await expect(service.create(consulta(), VET_ID)).rejects.toThrow(InternalServerErrorException);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rechaza una fecha futura con 400 y no guarda', async () => {
      await expect(service.create(consulta({ fecha: '2026-11-10T12:00:00Z' }), VET_ID)).rejects.toThrow(
        BadRequestException,
      );
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('acepta un evento de hoy (no es futuro)', async () => {
      await expect(service.create(consulta({ fecha: '2026-11-09T11:59:00Z' }), VET_ID)).resolves.toBeDefined();
    });

    it.each([
      ['sin nombre de vacuna', { nombreVacuna: undefined }],
      ['sin lote', { lote: undefined }],
      ['sin fecha de proxima dosis', { fechaProximaDosis: undefined }],
      ['con diagnostico', { diagnostico: 'Sano' }],
      ['con proximo control', { proximoControl: '2026-12-01' }],
    ])('vacuna %s -> 400', async (_caso, cambio) => {
      await expect(service.create(vacuna(cambio as any), VET_ID)).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it.each([
      ['sin diagnostico', { diagnostico: undefined }],
      ['sin proximo control', { proximoControl: undefined }],
      ['con nombre de vacuna', { nombreVacuna: 'Rabia' }],
      ['con lote', { lote: 'L-1' }],
      ['con fecha de proxima dosis', { fechaProximaDosis: '2027-01-01' }],
    ])('consulta %s -> 400', async (_caso, cambio) => {
      await expect(service.create(consulta(cambio as any), VET_ID)).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('tambien valida las reglas de un control (no solo de consulta)', async () => {
      await expect(
        service.create(consulta({ tipo: ClinicalEventType.CONTROL, diagnostico: undefined }), VET_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('propaga el error si el repositorio falla', async () => {
      repo.save.mockRejectedValue(new Error('db caida'));
      await expect(service.create(consulta(), VET_ID)).rejects.toThrow('db caida');
    });
  });

  describe('update', () => {
    const existing = (over: object = {}) => ({ id: 'e1', petId: PET_ID, veterinarianId: VET_ID, ...over });

    it('el veterinario autor edita su evento', async () => {
      repo.findById.mockResolvedValue(existing());
      repo.update.mockResolvedValue({ id: 'e1', notes: 'editado' });

      const result = await service.update('e1', consulta({ observaciones: 'editado' }), vet);

      expect(repo.update).toHaveBeenCalledWith(
        'e1',
        expect.objectContaining({ petId: PET_ID, notes: 'editado' }),
        undefined,
      );
      expect(result).toEqual({ id: 'e1', notes: 'editado' });
    });

    it('un administrador puede editar el evento de otro veterinario', async () => {
      repo.findById.mockResolvedValue(existing());
      repo.update.mockResolvedValue({ id: 'e1' });

      await expect(service.update('e1', consulta(), admin)).resolves.toEqual({ id: 'e1' });
    });

    it('editar una vacuna envia los datos de vacuna al repositorio', async () => {
      repo.findById.mockResolvedValue(existing());
      repo.update.mockResolvedValue({ id: 'e1' });

      await service.update('e1', vacuna(), vet);

      expect(repo.update).toHaveBeenCalledWith('e1', expect.any(Object), {
        vaccine: 'Rabia',
        batch: 'L-123',
        boosterDate: '2027-11-01',
      });
    });

    it('evento inexistente -> 404', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('x', consulta(), vet)).rejects.toThrow(NotFoundException);
    });

    it('otro veterinario (no autor ni admin) -> 403 y no se modifica', async () => {
      repo.findById.mockResolvedValue(existing());

      await expect(service.update('e1', consulta(), otherVet)).rejects.toThrow(ForbiddenException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('no permite cambiar la mascota del evento -> 400', async () => {
      repo.findById.mockResolvedValue(existing({ petId: 'otra-mascota' }));

      await expect(service.update('e1', consulta(), vet)).rejects.toThrow(BadRequestException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('aplica las mismas validaciones que al crear (fecha futura -> 400)', async () => {
      repo.findById.mockResolvedValue(existing());

      await expect(service.update('e1', consulta({ fecha: '2026-11-10T12:00:00Z' }), vet)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('si el repositorio no encuentra el evento al actualizar -> 404', async () => {
      repo.findById.mockResolvedValue(existing());
      repo.update.mockResolvedValue(null);

      await expect(service.update('e1', consulta(), vet)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByPetId (carnet)', () => {
    it.each([
      ['veterinario', vet],
      ['recepcion', reception],
      ['administrador', admin],
    ])('%s ve el carnet sin verificar propiedad', async (_rol, user) => {
      repo.findByPetId.mockResolvedValue([{ id: 'e1' }]);

      await expect(service.findByPetId(PET_ID, user)).resolves.toEqual([{ id: 'e1' }]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('el dueño de la mascota ve su carnet (se consulta con la clave interna)', async () => {
      repo.findByPetId.mockResolvedValue([{ id: 'e1' }]);

      await expect(service.findByPetId(PET_ID, owner)).resolves.toEqual([{ id: 'e1' }]);
      expect(fetchMock).toHaveBeenCalledWith(
        `http://clients:3002/internal/pets/${PET_ID}/owner/${OWNER_ID}`,
        { headers: { 'X-Internal-Key': 'k-test' } },
      );
    });

    it('un dueño ajeno recibe 403 (BR-8) y no se leen eventos', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 404 });

      await expect(service.findByPetId(PET_ID, owner)).rejects.toThrow(ForbiddenException);
      expect(repo.findByPetId).not.toHaveBeenCalled();
    });

    it('error distinto de 404 al verificar propiedad -> 503', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 500 });
      await expect(service.findByPetId(PET_ID, owner)).rejects.toThrow(ServiceUnavailableException);
    });

    it('sin conexion al verificar propiedad -> 503', async () => {
      fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
      await expect(service.findByPetId(PET_ID, owner)).rejects.toThrow(ServiceUnavailableException);
    });

    it('sin clave interna -> 500', async () => {
      delete process.env.INTERNAL_API_KEY;
      delete process.env.INTERNAL_KEY;

      await expect(service.findByPetId(PET_ID, owner)).rejects.toThrow(InternalServerErrorException);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('acepta INTERNAL_KEY como alternativa y usa localhost si no hay URL configurada', async () => {
      delete process.env.INTERNAL_API_KEY;
      delete process.env.CLIENTS_SERVICE_URL;
      process.env.INTERNAL_KEY = 'k-alt';
      repo.findByPetId.mockResolvedValue([]);

      await service.findByPetId(PET_ID, owner);

      expect(fetchMock).toHaveBeenCalledWith(
        `http://localhost:3002/internal/pets/${PET_ID}/owner/${OWNER_ID}`,
        { headers: { 'X-Internal-Key': 'k-alt' } },
      );
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
