import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeviceTokensRepository } from '../../devices/repositories/device-tokens.repository';
import { ScheduledReminder } from '../entities/scheduled-reminder.entity';
import { PUSH_SENDER, PushSender } from '../push/push-sender.interface';
import { NotificationLogRepository } from '../repositories/notification-log.repository';
import { RemindersRepository } from '../repositories/reminders.repository';
import { UserNotificationsRepository } from '../repositories/user-notifications.repository';

/**
 * [H1] Capa de aplicación: entrega de recordatorios vencidos.
 * Por cada recordatorio: lo reclama en la BD (evita envíos duplicados), busca
 * los dispositivos del dueño, envía el push, deja una fila en notification_log
 * por intento, elimina tokens inválidos y aplica reintentos con backoff.
 */
@Injectable()
export class ReminderDispatcherService implements OnModuleInit {
  private readonly logger = new Logger(ReminderDispatcherService.name);
  private readonly maxAttempts: number;
  private readonly retryBaseSeconds: number;

  constructor(
    private readonly remindersRepository: RemindersRepository,
    private readonly deviceTokensRepository: DeviceTokensRepository,
    private readonly notificationLogRepository: NotificationLogRepository,
    private readonly userNotificationsRepository: UserNotificationsRepository,
    @Inject(PUSH_SENDER) private readonly pushSender: PushSender,
    configService: ConfigService,
  ) {
    this.maxAttempts = configService.get<number>('reminderMaxAttempts') ?? 3;
    this.retryBaseSeconds = configService.get<number>('reminderRetryBaseSeconds') ?? 30;
  }

  /** Libera los recordatorios que quedaron 'processing' si el servicio se cayó a mitad de envío. */
  async onModuleInit(): Promise<void> {
    const released = await this.remindersRepository.resetProcessing();
    if (released > 0) {
      this.logger.warn(`${released} recordatorio(s) en 'processing' devueltos a 'pending'`);
    }
  }

  /** Procesa los recordatorios pendientes cuya hora ya llegó. Devuelve cuántos logró reclamar. */
  async dispatchDue(): Promise<number> {
    const due = await this.remindersRepository.findDue(new Date());
    let taken = 0;
    for (const reminder of due) {
      if (await this.dispatch(reminder)) taken++;
    }
    return taken;
  }

  /** Envío inmediato de un recordatorio puntual (cita reservada con poca anticipación). */
  async dispatchById(id: string): Promise<void> {
    const reminder = await this.remindersRepository.findById(id);
    if (reminder && reminder.status === 'pending') {
      await this.dispatch(reminder);
    }
  }

  private async dispatch(reminder: ScheduledReminder): Promise<boolean> {
    // Si el job, el envío inmediato u otra instancia ya lo reclamó, no se toca.
    if (!(await this.remindersRepository.claim(reminder.id))) return false;

    try {
      await this.deliver(reminder);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      await this.fail(reminder, message);
    }
    return true;
  }

  private async deliver(reminder: ScheduledReminder): Promise<void> {
    await this.userNotificationsRepository.createFromReminder(reminder);

    const devices = await this.deviceTokensRepository.findActiveByUser(reminder.userId);
    if (devices.length === 0) {
      await this.fail(reminder, 'El usuario no tiene dispositivos registrados');
      return;
    }

    const deliveredDeviceIds: string[] = [];
    const invalidTokens: string[] = [];

    for (const device of devices) {
      const result = await this.pushSender.send(device.token, {
        title: reminder.title ?? 'Recordatorio',
        body: reminder.body ?? '',
        data: { type: reminder.type ?? '', refId: reminder.refId ?? '' },
      });

      // Se registra el id del dispositivo, nunca el token completo.
      await this.notificationLogRepository.create({
        reminderId: reminder.id,
        channel: 'push',
        providerResponse: {
          deviceId: device.id,
          ok: result.ok,
          messageId: result.messageId,
          invalidToken: result.invalidToken,
          error: result.error,
        },
      });

      if (result.ok) {
        deliveredDeviceIds.push(device.id);
      } else if (result.invalidToken) {
        invalidTokens.push(device.token);
      }
    }

    await this.deviceTokensRepository.removeByTokens(invalidTokens);

    if (deliveredDeviceIds.length > 0) {
      await this.deviceTokensRepository.markUsed(deliveredDeviceIds);
      await this.remindersRepository.markSent(reminder.id);
      this.logger.log(`Recordatorio ${reminder.id} enviado a ${deliveredDeviceIds.length} dispositivo(s)`);
    } else {
      await this.fail(reminder, 'No se pudo entregar a ningún dispositivo');
    }
  }

  private async fail(reminder: ScheduledReminder, message: string): Promise<void> {
    const attempts = reminder.attempts + 1;
    const giveUp = attempts >= this.maxAttempts;
    // Backoff exponencial: base, 2×base, 4×base... (el siguiente tick del job lo recoge).
    const retryAt = giveUp
      ? undefined
      : new Date(Date.now() + this.retryBaseSeconds * 1000 * 2 ** (attempts - 1));

    await this.remindersRepository.registerFailure(reminder.id, message, attempts, giveUp, retryAt);
    this.logger.warn(
      `Recordatorio ${reminder.id}: intento ${attempts}/${this.maxAttempts} fallido (${message})` +
        (giveUp ? ' -> queda en estado error' : ` -> se reintentará después de ${retryAt?.toISOString()}`),
    );
  }
}