import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLog } from '../entities/notification-log.entity';

/** [H1] Repositorio tipado — persistencia exclusiva de `notifications.notification_log`. */
@Injectable()
export class NotificationLogRepository {
  constructor(
    @InjectRepository(NotificationLog)
    private readonly repo: Repository<NotificationLog>,
  ) {}

  create(data: Partial<NotificationLog>): Promise<NotificationLog> {
    return this.repo.save(this.repo.create(data));
  }
}
