import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesModule } from '../devices/devices.module';
import { NotificationLog } from './entities/notification-log.entity';
import { ScheduledReminder } from './entities/scheduled-reminder.entity';
import { ReminderDispatchJob } from './jobs/reminder-dispatch.job';
import { LogPushSender } from './push/log-push-sender';
import { PUSH_SENDER } from './push/push-sender.interface';
import { NotificationLogRepository } from './repositories/notification-log.repository';
import { RemindersRepository } from './repositories/reminders.repository';
import { ReminderDispatcherService } from './services/reminder-dispatcher.service';
import { RemindersService } from './services/reminders.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduledReminder, NotificationLog]), DevicesModule],
  providers: [
    RemindersRepository,
    NotificationLogRepository,
    RemindersService,
    ReminderDispatcherService,
    ReminderDispatchJob,
    // Envio simulado.cuandp se tenga la credencial de Firebase se cambia useClass por FirebasePushSender.
    { provide: PUSH_SENDER, useClass: LogPushSender },
  ],
  exports: [RemindersRepository, RemindersService],
})
export class RemindersModule {}
