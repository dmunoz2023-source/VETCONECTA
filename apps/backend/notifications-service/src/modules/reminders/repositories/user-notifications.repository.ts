import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduledReminder } from '../entities/scheduled-reminder.entity';
import { UserNotification } from '../entities/user-notification.entity';

/** [H1] Repositorio tipado: persistencia exclusiva de `notifications.user_notifications`. */
@Injectable()
export class UserNotificationsRepository {
  constructor(
    @InjectRepository(UserNotification)
    private readonly repo: Repository<UserNotification>,
  ) {}

  /**
   * Crea el aviso del centro de avisos a partir de un recordatorio.
   * Es idempotente: si ya existe uno para ese recordatorio (reintentos),
   * `ON CONFLICT DO NOTHING` lo ignora gracias a UNIQUE (reminder_id).
   */
  async createFromReminder(reminder: ScheduledReminder): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(UserNotification)
      .values({
        userId: reminder.userId,
        reminderId: reminder.id,
        type: reminder.type,
        refId: reminder.refId,
        title: reminder.title,
        body: reminder.body,
      })
      .orIgnore()
      .execute();
  }
}