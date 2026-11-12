import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { AppointmentsRepository } from '../repositories/appointments.repository';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AvailabilityPort } from '../availability/availability.port';
import { PetsLookup } from '../clients/pets.lookup';
import { RemindersClient } from '../clients/reminders.client';
import { AppointmentsService } from './appointments.service';

const CLIENT = '22222222-2222-2222-2222-222222222222';
const OTHER_CLIENT = '77777777-7777-7777-7777-777777777777';
const PET = '11111111-1111-1111-1111-111111111111';
const VET = '55555555-5555-5555-5555-555555555551';
const OTHER_VET = '55555555-5555-5555-5555-555555555552';
const SPECIALTY = '44444444-4444-4444-4444-444444444441';
const NOW = new Date('2026-11-09T12:00:00Z');
const FUTURE = '2026-11-10T15:00:00-03:00';

const owner: JwtPayload = { sub: 'owner-1', email: 'o@vet.cl', role: 'owner', clientId: CLIENT };
const reception: JwtPayload = { sub: 'rec-1', email: 'r@vet.cl', role: 'reception' };
const vet: JwtPayload = { sub: VET, email: 'v@vet.cl', role: 'vet' };

const pet = { id: PET, name: 'Firulais', clientId: CLIENT, ownerUserId: 'owner-1', active: true };
const block = {
  slotId: 'slot-1',
  startTime: new Date('2026-11-10T18:00:00Z'),
  endTime: new Date('2026-11-10T18:30:00Z'),
};
const dto = { petId: PET, vetUserId: VET, specialtyId: SPECIALTY, startTime: FUTURE };

describe('AppointmentsService [G2]', () => {
  const appointmentsRepo = { findByClient: jest.fn() };
  const auditLog = { record: jest.fn() };
  const petsLookup = { findById: jest.fn() };
  const reminders = { schedule: jest.fn(), cancel: jest.fn() };
  const availability = { findBlock: jest.fn() };

  // Repositorio transaccional falso, comparte estado con cada prueba.
  const qb = { where: jest.fn(), andWhere: jest.fn(), getExists: jest.fn() };
  const txRepo = { createQueryBuilder: jest.fn(), create: jest.fn(), save: jest.fn(), findOne: jest.fn() };
  const manager = { query: jest.fn(), getRepository: jest.fn() };
  const dataSource = { transaction: jest.fn() };

  let service: AppointmentsService;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers({ now: NOW, doNotFake: ['nextTick'] });

    qb.where.mockReturnValue(qb);
    qb.andWhere.mockReturnValue(qb);
    qb.getExists.mockResolvedValue(false);
    txRepo.createQueryBuilder.mockReturnValue(qb);
    txRepo.create.mockImplementation((data) => ({ ...data }));
    txRepo.save.mockImplementation(async (data) => ({ id: 'apt-1', ...data }));
    manager.getRepository.mockReturnValue(txRepo);
    dataSource.transaction.mockImplementation(async (cb) => cb(manager));

    petsLookup.findById.mockResolvedValue(pet);
    availability.findBlock.mockResolvedValue(block);
    reminders.schedule.mockResolvedValue(true);
    reminders.cancel.mockResolvedValue(true);

    service = new AppointmentsService(
      appointmentsRepo as unknown as AppointmentsRepository,
      auditLog as unknown as AuditLogRepository,
      dataSource as unknown as DataSource,
      petsLookup as unknown as PetsLookup,
      reminders as unknown as RemindersClient,
      availability as unknown as AvailabilityPort,
    );
  });

  afterEach(() => jest.useRealTimers());

  describe('findMyCitas', () => {
    it('lista solo las citas del cliente del JWT y calcula la paginacion', async () => {
      appointmentsRepo.findByClient.mockResolvedValue([[{ id: 'a1' }], 25]);

      const result = await service.findMyCitas(CLIENT, { status: 'booked', page: 2, limit: 10 } as any);

      expect(appointmentsRepo.findByClient).toHaveBeenCalledWith(CLIENT, { status: 'booked', page: 2, limit: 10 });
      expect(result.meta).toEqual({ total: 25, page: 2, limit: 10, totalPages: 3 });
    });

    it('sin clientId responde 403 (BR-8)', async () => {
      await expect(service.findMyCitas(undefined, { page: 1, limit: 10 } as any)).rejects.toThrow(ForbiddenException);
      expect(appointmentsRepo.findByClient).not.toHaveBeenCalled();
    });

    it('con limit 0 devuelve totalPages 0 en vez de NaN', async () => {
      appointmentsRepo.findByClient.mockResolvedValue([[], 0]);

      const result = await service.findMyCitas(CLIENT, { page: 1, limit: 0 } as any);

      expect(result.meta.totalPages).toBe(0);
    });
  });

  describe('create (POST /v1/citas)', () => {
    it('reserva la hora: guarda la cita, registra auditoria y programa el recordatorio', async () => {
      const result = await service.create(owner, dto);

      expect(manager.query).toHaveBeenCalledWith(expect.stringContaining('pg_advisory_xact_lock'), [`appointments:${VET}`]);
      expect(txRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slotId: 'slot-1',
          petId: PET,
          clientId: CLIENT,
          vetUserId: VET,
          status: 'booked',
          channel: 'app',
          createdBy: 'owner-1',
          startTime: block.startTime,
          endTime: block.endTime,
        }),
      );
      expect(auditLog.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'appointment.created', entityId: 'apt-1', actorUserId: 'owner-1' }),
        manager,
      );
      expect(reminders.schedule).toHaveBeenCalledWith({
        appointmentId: 'apt-1',
        ownerUserId: 'owner-1',
        petName: 'Firulais',
        startsAt: block.startTime,
      });
      expect(result.id).toBe('apt-1');
    });

    it('recepcion reserva para cualquier mascota y el canal queda como web', async () => {
      await service.create(reception, dto);

      expect(txRepo.create).toHaveBeenCalledWith(expect.objectContaining({ channel: 'web', createdBy: 'rec-1' }));
    });

    it('rechaza una hora que ya paso con 400 sin consultar nada', async () => {
      await expect(service.create(owner, { ...dto, startTime: '2026-11-09T11:00:00Z' })).rejects.toThrow(
        BadRequestException,
      );
      expect(petsLookup.findById).not.toHaveBeenCalled();
    });

    it('rechaza una hora exactamente igual a ahora', async () => {
      await expect(service.create(owner, { ...dto, startTime: NOW.toISOString() })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('mascota inexistente -> 404', async () => {
      petsLookup.findById.mockResolvedValue(null);
      await expect(service.create(owner, dto)).rejects.toThrow(NotFoundException);
    });

    it('mascota dada de baja -> 404', async () => {
      petsLookup.findById.mockResolvedValue({ ...pet, active: false });
      await expect(service.create(owner, dto)).rejects.toThrow(NotFoundException);
    });

    it('un dueño no puede reservar para la mascota de otro cliente (BR-8) -> 403', async () => {
      petsLookup.findById.mockResolvedValue({ ...pet, clientId: OTHER_CLIENT });

      await expect(service.create(owner, dto)).rejects.toThrow(ForbiddenException);
      expect(availability.findBlock).not.toHaveBeenCalled();
    });

    it('sin bloque disponible a esa hora -> 404', async () => {
      availability.findBlock.mockResolvedValue(null);

      await expect(service.create(owner, dto)).rejects.toThrow(NotFoundException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('horario ya ocupado (solapamiento) -> 409 y no se guarda ni se avisa (BR-5)', async () => {
      qb.getExists.mockResolvedValue(true);

      await expect(service.create(owner, dto)).rejects.toThrow(new ConflictException('Horario ya reservado'));
      expect(txRepo.save).not.toHaveBeenCalled();
      expect(reminders.schedule).not.toHaveBeenCalled();
    });

    it('solo considera citas booked/confirmed al buscar solapamientos', async () => {
      await service.create(owner, dto);

      expect(qb.andWhere).toHaveBeenCalledWith('a.status IN (:...active)', { active: ['booked', 'confirmed'] });
    });

    it('si el indice unico de la BD falla (carrera entre dos reservas) -> 409', async () => {
      const dbError = new QueryFailedError('INSERT', [], Object.assign(new Error('dup'), { code: '23505' }));
      txRepo.save.mockRejectedValue(dbError);

      await expect(service.create(owner, dto)).rejects.toThrow(new ConflictException('Horario ya reservado'));
    });

    it('un error de BD distinto de violacion de unicidad se propaga tal cual', async () => {
      const dbError = new QueryFailedError('INSERT', [], Object.assign(new Error('otra'), { code: '08006' }));
      txRepo.save.mockRejectedValue(dbError);

      await expect(service.create(owner, dto)).rejects.toBe(dbError);
    });

    it('un error cualquiera dentro de la transaccion se propaga', async () => {
      txRepo.save.mockRejectedValue(new Error('boom'));
      await expect(service.create(owner, dto)).rejects.toThrow('boom');
    });

    it('si el recordatorio falla la cita igual queda creada (no se revierte)', async () => {
      reminders.schedule.mockResolvedValue(false);

      await expect(service.create(owner, dto)).resolves.toMatchObject({ id: 'apt-1' });
    });
  });

  describe('cancel (PATCH /v1/citas/:id/cancelar)', () => {
    const current = (over: object = {}) => ({
      id: 'apt-1',
      clientId: CLIENT,
      vetUserId: VET,
      status: 'booked',
      startTime: new Date('2026-11-10T18:00:00Z'),
      cancelledAt: null,
      ...over,
    });

    it('el dueño cancela su cita futura: queda cancelled, con auditoria y recordatorio anulado', async () => {
      txRepo.findOne.mockResolvedValue(current());

      const result = await service.cancel(owner, 'apt-1');

      expect(txRepo.findOne).toHaveBeenCalledWith({ where: { id: 'apt-1' }, lock: { mode: 'pessimistic_write' } });
      expect(result.status).toBe('cancelled');
      expect(result.cancelledAt).toEqual(NOW);
      expect(auditLog.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'appointment.cancelled', data: { from: 'booked' } }),
        manager,
      );
      expect(reminders.cancel).toHaveBeenCalledWith('apt-1');
    });

    it('recepcion puede cancelar una cita de cualquier cliente, incluso una que ya comenzo', async () => {
      txRepo.findOne.mockResolvedValue(current({ clientId: OTHER_CLIENT, startTime: new Date('2026-11-09T10:00:00Z') }));

      await expect(service.cancel(reception, 'apt-1')).resolves.toMatchObject({ status: 'cancelled' });
    });

    it('cita inexistente -> 404', async () => {
      txRepo.findOne.mockResolvedValue(null);
      await expect(service.cancel(owner, 'x')).rejects.toThrow(NotFoundException);
    });

    it('un dueño no puede cancelar la cita de otro cliente (BR-8) -> 403', async () => {
      txRepo.findOne.mockResolvedValue(current({ clientId: OTHER_CLIENT }));

      await expect(service.cancel(owner, 'apt-1')).rejects.toThrow(ForbiddenException);
      expect(txRepo.save).not.toHaveBeenCalled();
    });

    it('un dueño no puede cancelar una cita que ya comenzo -> 400', async () => {
      txRepo.findOne.mockResolvedValue(current({ startTime: new Date('2026-11-09T11:00:00Z') }));

      await expect(service.cancel(owner, 'apt-1')).rejects.toThrow(BadRequestException);
    });

    it.each(['cancelled', 'completed', 'no_show'])('una cita en estado %s ya no se puede cancelar -> 409', async (status) => {
      txRepo.findOne.mockResolvedValue(current({ status }));

      await expect(service.cancel(owner, 'apt-1')).rejects.toThrow(ConflictException);
      expect(reminders.cancel).not.toHaveBeenCalled();
    });

    it('cancela tambien una cita confirmed', async () => {
      txRepo.findOne.mockResolvedValue(current({ status: 'confirmed' }));

      await expect(service.cancel(owner, 'apt-1')).resolves.toMatchObject({ status: 'cancelled' });
    });

    it('si no se puede anular el recordatorio la cancelacion igual se mantiene', async () => {
      txRepo.findOne.mockResolvedValue(current());
      reminders.cancel.mockResolvedValue(false);

      await expect(service.cancel(owner, 'apt-1')).resolves.toMatchObject({ status: 'cancelled' });
    });
  });

  describe('updateStatus (PATCH /v1/citas/:id/estado)', () => {
    const current = (over: object = {}) => ({ id: 'apt-1', vetUserId: VET, status: 'booked', ...over });

    it('el veterinario cierra su propia cita como completed', async () => {
      txRepo.findOne.mockResolvedValue(current());

      const result = await service.updateStatus(vet, 'apt-1', 'completed');

      expect(result.status).toBe('completed');
      expect(auditLog.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'appointment.status_changed',
          data: { from: 'booked', to: 'completed' },
        }),
        manager,
      );
    });

    it('recepcion puede marcar no_show en la cita de cualquier veterinario', async () => {
      txRepo.findOne.mockResolvedValue(current({ vetUserId: OTHER_VET, status: 'confirmed' }));

      await expect(service.updateStatus(reception, 'apt-1', 'no_show')).resolves.toMatchObject({ status: 'no_show' });
    });

    it('cita inexistente -> 404', async () => {
      txRepo.findOne.mockResolvedValue(null);
      await expect(service.updateStatus(vet, 'x', 'completed')).rejects.toThrow(NotFoundException);
    });

    it('un veterinario no puede cerrar la cita de otro veterinario -> 403', async () => {
      txRepo.findOne.mockResolvedValue(current({ vetUserId: OTHER_VET }));

      await expect(service.updateStatus(vet, 'apt-1', 'completed')).rejects.toThrow(ForbiddenException);
      expect(txRepo.save).not.toHaveBeenCalled();
    });

    it.each(['cancelled', 'completed', 'no_show'])('no se puede cambiar el estado desde %s -> 409', async (status) => {
      txRepo.findOne.mockResolvedValue(current({ status }));

      await expect(service.updateStatus(vet, 'apt-1', 'completed')).rejects.toThrow(ConflictException);
    });
  });
});