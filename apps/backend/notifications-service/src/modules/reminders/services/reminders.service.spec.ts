import { BadRequestException, Logger } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { REMINDER_TYPE_APPOINTMENT } from '../reminders.constants';

const NOW = new Date('2026-11-13T12:00:00.000Z');
const APPOINTMENT_ID = '11111111-1111-4111-8111-111111111111';
const OWNER_ID = '22222222-2222-4222-8222-222222222222';

function build(config: Record<string, number> = {}) {
  const repo = {
    findByRef: jest.fn(),
    create: jest.fn(),
    cancelByRef: jest.fn(),
  };
  const dispatcher = { dispatchById: jest.fn().mockResolvedValue(undefined) };
  const configService = { get: jest.fn((key: string) => config[key]) };
  const service = new RemindersService(repo as any, dispatcher as any, configService as any);
  return { service, repo, dispatcher };
}

function dto(startsAt: Date) {
  return {
    appointmentId: APPOINTMENT_ID,
    ownerUserId: OWNER_ID,
    petName: 'Firulais',
    startsAt: startsAt.toISOString(),
  };
}

const minutes = (n: number) => n * 60_000;

describe('RemindersService', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW, doNotFake: ['nextTick', 'setImmediate'] });
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('scheduleAppointmentReminder', () => {
    it('rechaza una cita que ya paso', async () => {
      const { service, repo } = build();
      await expect(
        service.scheduleAppointmentReminder(dto(new Date(NOW.getTime() - 1000))),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('calcula fireAt = cita - 1440 min por defecto y no envia de inmediato', async () => {
      const { service, repo, dispatcher } = build();
      const startsAt = new Date(NOW.getTime() + minutes(3 * 24 * 60));
      repo.findByRef.mockResolvedValue(null);
      repo.create.mockImplementation(async (d) => ({ id: 'r1', ...d }));

      const res = await service.scheduleAppointmentReminder(dto(startsAt));

      const expected = new Date(startsAt.getTime() - minutes(1440));
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: REMINDER_TYPE_APPOINTMENT,
          refId: APPOINTMENT_ID,
          userId: OWNER_ID,
          status: 'pending',
          fireAt: expected,
        }),
      );
      expect(res).toMatchObject({ immediate: false, alreadyExisted: false, fireAt: expected });
      expect(dispatcher.dispatchById).not.toHaveBeenCalled();
    });

    it('respeta la anticipacion configurable (REMINDER_LEAD_MINUTES)', async () => {
      const { service, repo } = build({ reminderLeadMinutes: 2 });
      const startsAt = new Date(NOW.getTime() + minutes(10));
      repo.findByRef.mockResolvedValue(null);
      repo.create.mockImplementation(async (d) => ({ id: 'r1', ...d }));

      const res = await service.scheduleAppointmentReminder(dto(startsAt));

      expect(res.fireAt).toEqual(new Date(startsAt.getTime() - minutes(2)));
      expect(res.immediate).toBe(false);
    });

    it('si faltan menos de 24 h programa para ahora y envia de inmediato', async () => {
      const { service, repo, dispatcher } = build();
      const startsAt = new Date(NOW.getTime() + minutes(5 * 60)); // en 5 h
      repo.findByRef.mockResolvedValue(null);
      repo.create.mockImplementation(async (d) => ({ id: 'r1', ...d }));

      const res = await service.scheduleAppointmentReminder(dto(startsAt));

      expect(res).toMatchObject({ immediate: true, fireAt: NOW });
      expect(dispatcher.dispatchById).toHaveBeenCalledWith('r1');
    });

    it('un fallo del envio inmediato no rompe la respuesta', async () => {
      const { service, repo, dispatcher } = build();
      repo.findByRef.mockResolvedValue(null);
      repo.create.mockImplementation(async (d) => ({ id: 'r1', ...d }));
      dispatcher.dispatchById.mockRejectedValue(new Error('boom'));

      const res = await service.scheduleAppointmentReminder(
        dto(new Date(NOW.getTime() + minutes(60))),
      );

      expect(res.immediate).toBe(true);
      await new Promise((r) => setImmediate(r)); // deja correr el catch
      expect(Logger.prototype.error).toHaveBeenCalled();
    });

    it('no duplica si la cita ya tiene recordatorio', async () => {
      const { service, repo, dispatcher } = build();
      const existing = { id: 'old', fireAt: NOW, status: 'pending' };
      repo.findByRef.mockResolvedValue(existing);

      const res = await service.scheduleAppointmentReminder(
        dto(new Date(NOW.getTime() + minutes(3 * 24 * 60))),
      );

      expect(res).toMatchObject({ id: 'old', alreadyExisted: true, immediate: false });
      expect(repo.create).not.toHaveBeenCalled();
      expect(dispatcher.dispatchById).not.toHaveBeenCalled();
    });
  });

  describe('cancelByRef', () => {
    it('devuelve cuantos recordatorios se cancelaron', async () => {
      const { service, repo } = build();
      repo.cancelByRef.mockResolvedValue(1);

      await expect(service.cancelByRef('appointment', APPOINTMENT_ID)).resolves.toEqual({
        cancelled: 1,
      });
      expect(repo.cancelByRef).toHaveBeenCalledWith('appointment', APPOINTMENT_ID);
    });

    it('devuelve 0 si no habia pendientes', async () => {
      const { service, repo } = build();
      repo.cancelByRef.mockResolvedValue(0);
      await expect(service.cancelByRef('appointment', APPOINTMENT_ID)).resolves.toEqual({
        cancelled: 0,
      });
    });
  });
});