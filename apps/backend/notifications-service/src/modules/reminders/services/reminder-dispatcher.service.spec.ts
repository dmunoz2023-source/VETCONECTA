import { Logger } from '@nestjs/common';
import { ReminderDispatcherService } from './reminder-dispatcher.service';

function reminder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'r1',
    type: 'appointment',
    refId: 'a1',
    userId: 'u1',
    title: 'Recordatorio de cita',
    body: 'Tu cita',
    fireAt: new Date(),
    status: 'pending',
    attempts: 0,
    lastError: null,
    ...overrides,
  } as any;
}

const device = (id: string, token: string) => ({ id, token, userId: 'u1', active: true });

function build(maxAttempts?: number) {
  const reminders = {
    findDue: jest.fn(),
    findById: jest.fn(),
    markSent: jest.fn().mockResolvedValue(undefined),
    registerFailure: jest.fn().mockResolvedValue(undefined),
  };
  const tokens = {
    findActiveByUser: jest.fn(),
    removeByTokens: jest.fn().mockResolvedValue(undefined),
    markUsed: jest.fn().mockResolvedValue(undefined),
  };
  const log = { create: jest.fn().mockResolvedValue(undefined) };
  const notifications = { createFromReminder: jest.fn().mockResolvedValue(undefined) };
  const push = { send: jest.fn() };
  const config = {
    get: jest.fn((key: string) => (key === 'reminderMaxAttempts' ? maxAttempts : undefined)),
  };
  const service = new ReminderDispatcherService(
    reminders as any,
    tokens as any,
    log as any,
    notifications as any,
    push as any,
    config as any,
  );
  return { service, reminders, tokens, log, notifications, push };
}

describe('ReminderDispatcherService', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });
  afterEach(() => jest.restoreAllMocks());

  describe('dispatchDue', () => {
    it('procesa todos los vencidos y devuelve cuantos tomo', async () => {
      const { service, reminders, tokens, push } = build();
      reminders.findDue.mockResolvedValue([reminder({ id: 'r1' }), reminder({ id: 'r2' })]);
      tokens.findActiveByUser.mockResolvedValue([device('d1', 'tok-1')]);
      push.send.mockResolvedValue({ ok: true, messageId: 'm1' });

      const taken = await service.dispatchDue();

      expect(taken).toBe(2);
      expect(reminders.markSent).toHaveBeenCalledTimes(2);
    });

    it('devuelve 0 si no hay vencidos', async () => {
      const { service, reminders, push } = build();
      reminders.findDue.mockResolvedValue([]);
      await expect(service.dispatchDue()).resolves.toBe(0);
      expect(push.send).not.toHaveBeenCalled();
    });
  });

  describe('entrega exitosa', () => {
    it('envia a cada dispositivo, marca enviado y registra uso', async () => {
      const { service, reminders, tokens, push, log } = build();
      reminders.findById.mockResolvedValue(reminder());
      tokens.findActiveByUser.mockResolvedValue([
        device('d1', 'token-aaaaaaaa'),
        device('d2', 'token-bbbbbbbb'),
      ]);
      push.send.mockResolvedValue({ ok: true, messageId: 'm1' });

      await service.dispatchById('r1');

      expect(push.send).toHaveBeenCalledTimes(2);
      expect(push.send).toHaveBeenCalledWith(
        'token-aaaaaaaa',
        expect.objectContaining({ data: { type: 'appointment', refId: 'a1' } }),
      );
      expect(log.create).toHaveBeenCalledTimes(2);
      expect(tokens.markUsed).toHaveBeenCalledWith(['d1', 'd2']);
      expect(reminders.markSent).toHaveBeenCalledWith('r1');
      expect(reminders.registerFailure).not.toHaveBeenCalled();
    });

    it('el log guarda el id del dispositivo y nunca el token completo', async () => {
      const { service, reminders, tokens, push, log } = build();
      reminders.findById.mockResolvedValue(reminder());
      tokens.findActiveByUser.mockResolvedValue([device('d1', 'SECRET-TOKEN-123')]);
      push.send.mockResolvedValue({ ok: true, messageId: 'm1' });

      await service.dispatchById('r1');

      const arg = log.create.mock.calls[0][0];
      expect(arg).toMatchObject({
        reminderId: 'r1',
        channel: 'push',
        providerResponse: { deviceId: 'd1', ok: true },
      });
      expect(JSON.stringify(arg)).not.toContain('SECRET-TOKEN-123');
    });
  });

  describe('tokens invalidos', () => {
    it('elimina los invalidos y sigue como enviado si otro dispositivo recibio', async () => {
      const { service, reminders, tokens, push } = build();
      reminders.findById.mockResolvedValue(reminder());
      tokens.findActiveByUser.mockResolvedValue([
        device('d1', 'invalid-token'),
        device('d2', 'good-token'),
      ]);
      push.send.mockImplementation(async (t: string) =>
        t.startsWith('invalid') ? { ok: false, invalidToken: true, error: 'x' } : { ok: true },
      );

      await service.dispatchById('r1');

      expect(tokens.removeByTokens).toHaveBeenCalledWith(['invalid-token']);
      expect(tokens.markUsed).toHaveBeenCalledWith(['d2']);
      expect(reminders.markSent).toHaveBeenCalledWith('r1');
    });

    it('si todos son invalidos elimina los tokens y cuenta un intento fallido', async () => {
      const { service, reminders, tokens, push } = build();
      reminders.findById.mockResolvedValue(reminder());
      tokens.findActiveByUser.mockResolvedValue([device('d1', 'invalid-1')]);
      push.send.mockResolvedValue({ ok: false, invalidToken: true, error: 'x' });

      await service.dispatchById('r1');

      expect(tokens.removeByTokens).toHaveBeenCalledWith(['invalid-1']);
      expect(reminders.markSent).not.toHaveBeenCalled();
      expect(reminders.registerFailure).toHaveBeenCalledWith('r1', expect.any(String), 1, false);
    });
  });

  describe('reintentos', () => {
    it('sin dispositivos: falla, incrementa intentos y se reintentara', async () => {
      const { service, reminders, tokens, push } = build();
      reminders.findById.mockResolvedValue(reminder({ attempts: 0 }));
      tokens.findActiveByUser.mockResolvedValue([]);

      await service.dispatchById('r1');

      expect(push.send).not.toHaveBeenCalled();
      expect(reminders.registerFailure).toHaveBeenCalledWith('r1', expect.any(String), 1, false);
    });

    it('usa 3 intentos por defecto: el tercer fallo deja el recordatorio en error', async () => {
      const { service, reminders, tokens, push } = build();
      reminders.findById.mockResolvedValue(reminder({ attempts: 2 }));
      tokens.findActiveByUser.mockResolvedValue([device('d1', 'tok')]);
      push.send.mockResolvedValue({ ok: false, error: 'unavailable' });

      await service.dispatchById('r1');

      expect(reminders.registerFailure).toHaveBeenCalledWith('r1', expect.any(String), 3, true);
    });

    it('respeta REMINDER_MAX_ATTEMPTS configurado', async () => {
      const { service, reminders, tokens, push } = build(5);
      reminders.findById.mockResolvedValue(reminder({ attempts: 2 }));
      tokens.findActiveByUser.mockResolvedValue([device('d1', 'tok')]);
      push.send.mockResolvedValue({ ok: false, error: 'unavailable' });

      await service.dispatchById('r1');

      expect(reminders.registerFailure).toHaveBeenCalledWith('r1', expect.any(String), 3, false);
    });

    it('si el sender lanza una excepcion la captura y registra el fallo', async () => {
      const { service, reminders, tokens, push } = build();
      reminders.findById.mockResolvedValue(reminder());
      tokens.findActiveByUser.mockResolvedValue([device('d1', 'tok')]);
      push.send.mockRejectedValue(new Error('network down'));

      await expect(service.dispatchById('r1')).resolves.toBeUndefined();

      expect(reminders.registerFailure).toHaveBeenCalledWith('r1', 'network down', 1, false);
    });
  });

  describe('dispatchById', () => {
    it.each([['cancelled'], ['sent'], ['error']])(
      'ignora un recordatorio en estado %s',
      async (status) => {
        const { service, reminders, push } = build();
        reminders.findById.mockResolvedValue(reminder({ status }));
        await service.dispatchById('r1');
        expect(push.send).not.toHaveBeenCalled();
      },
    );

    it('ignora un id inexistente', async () => {
      const { service, reminders, push } = build();
      reminders.findById.mockResolvedValue(null);
      await service.dispatchById('nope');
      expect(push.send).not.toHaveBeenCalled();
    });
  });

  describe('control inFlight', () => {
    it('dos despachos simultaneos del mismo recordatorio envian una sola vez', async () => {
      const { service, reminders, tokens, push } = build();
      reminders.findById.mockResolvedValue(reminder());
      tokens.findActiveByUser.mockResolvedValue([device('d1', 'tok')]);

      let release!: () => void;
      push.send.mockImplementation(
        () => new Promise((resolve) => (release = () => resolve({ ok: true }))),
      );

      const first = service.dispatchById('r1');
      const second = service.dispatchById('r1');
      await new Promise((r) => setImmediate(r));
      release();
      await Promise.all([first, second]);

      expect(push.send).toHaveBeenCalledTimes(1);
      expect(reminders.markSent).toHaveBeenCalledTimes(1);
    });
  });

  describe('centro de avisos', () => {
    it('crea el aviso del usuario al despachar, antes de enviar el push', async () => {
      const { service, reminders, tokens, push, notifications } = build();
      const r = reminder();
      reminders.findById.mockResolvedValue(r);
      tokens.findActiveByUser.mockResolvedValue([device('d1', 'tok')]);
      push.send.mockResolvedValue({ ok: true });

      await service.dispatchById('r1');

      expect(notifications.createFromReminder).toHaveBeenCalledWith(r);
      expect(notifications.createFromReminder.mock.invocationCallOrder[0]).toBeLessThan(
        push.send.mock.invocationCallOrder[0],
      );
    });

    it('crea el aviso aunque el usuario no tenga dispositivos', async () => {
      const { service, reminders, tokens, notifications } = build();
      reminders.findById.mockResolvedValue(reminder());
      tokens.findActiveByUser.mockResolvedValue([]);

      await service.dispatchById('r1');

      expect(notifications.createFromReminder).toHaveBeenCalledTimes(1);
    });

    it('si falla al crear el aviso, registra el fallo y no envia el push', async () => {
      const { service, reminders, push, notifications } = build();
      reminders.findById.mockResolvedValue(reminder());
      notifications.createFromReminder.mockRejectedValue(new Error('db caida'));

      await service.dispatchById('r1');

      expect(push.send).not.toHaveBeenCalled();
      expect(reminders.registerFailure).toHaveBeenCalledWith('r1', 'db caida', 1, false);
    });
  });
});