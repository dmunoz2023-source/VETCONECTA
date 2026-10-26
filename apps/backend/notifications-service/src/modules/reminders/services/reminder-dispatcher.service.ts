import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeviceTokensRepository } from '../../devices/repositories/device-tokens.repository';
import { ScheduledReminder } from '../entities/scheduled-reminder.entity';
import { PUSH_SENDER, PushSender } from '../push/push-sender.interface';
import { NotificationLogRepository } from '../repositories/notification-log.repository';
import { RemindersRepository } from '../repositories/reminders.repository';

/**
 * [H1] Capa de aplicación: entrega de recordatorios vencidos.
 * Por cada recordatorio: busca los dispositivos del dueño, envía el push,
 * deja una fila en notification_log por intento, elimina tokens inválidos y
 * aplica reintentos limitados.
 */
@Injectable()
export class ReminderDispatcherService {
  private readonly logger = new Logger(ReminderDispatcherService.name);
  private readonly inFlight = new Set<string>();
  private readonly maxAttempts: number;

  constructor(
    private readonly remindersRepository: RemindersRepository,
    private readonly deviceTokensRepository: DeviceTokensRepository,
    private readonly notificationLogRepository: NotificationLogRepository,
    @Inject(PUSH_SENDER) private readonly pushSender: PushSender,
    configService: ConfigService,
  ) {
    this.maxAttempts = configService.get<number>('reminderMaxAttempts') ?? 3;
  }

  /** Procesa todos los recordatorios pendientes cuya hora ya llegó. Devuelve cuántos tomó. */
  async dispatchDue(): Promise<number> {
    const due = await this.remindersRepository.findDue(new Date());
    for (const reminder of due) {
      await this.dispatch(reminder);
    }
    return due.length;
  }

  /** Envío inmediato de un recordatorio puntual (cita reservada con poca anticipación). */
  async dispatchById(id: string): Promise<void> {
    const reminder = await this.remindersRepository.findById(id);
    if (reminder && reminder.status === 'pending') {
      await this.dispatch(reminder);
    }
  }

  private async dispatch(reminder: ScheduledReminder): Promise<void> {
    // Evita que el job y el envío inmediato procesen el mismo recordatorio a la vez.
    if (this.inFlight.has(reminder.id)) return;
    this.inFlight.add(reminder.id);

    try {
      await this.deliver(reminder);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      await this.fail(reminder, message);
    } finally {
      this.inFlight.delete(reminder.id);
    }
  }

  private async deliver(reminder: ScheduledReminder): Promise<void> {
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
    await this.remindersRepository.registerFailure(reminder.id, message, attempts, giveUp);
    this.logger.warn(
      `Recordatorio ${reminder.id}: intento ${attempts}/${this.maxAttempts} fallido (${message})` +
        (giveUp ? ' -> queda en estado error' : ' -> se reintentará'),
    );
  }
}
