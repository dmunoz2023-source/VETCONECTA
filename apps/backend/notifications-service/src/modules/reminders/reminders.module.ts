import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirebaseConfig } from '../../config/configuration';
import { DevicesModule } from '../devices/devices.module';
import { NotificationLog } from './entities/notification-log.entity';
import { ScheduledReminder } from './entities/scheduled-reminder.entity';
import { ReminderDispatchJob } from './jobs/reminder-dispatch.job';
import { FirebasePushSender } from './push/firebase-push-sender';
import { LogPushSender } from './push/log-push-sender';
import { PUSH_SENDER, PushSender } from './push/push-sender.interface';
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
    {
      provide: PUSH_SENDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): PushSender => {
        const logger = new Logger('PushSender');
        const firebase = config.get<FirebaseConfig>('firebase');
        if (firebase?.projectId && firebase.clientEmail && firebase.privateKey) {
          logger.log('Envío de push: Firebase (real)');
          return new FirebasePushSender(firebase);
        }
        logger.warn('Sin credencial de Firebase: envío de push SIMULADO (solo log)');
        return new LogPushSender();
      },
    },
  ],
  exports: [RemindersRepository, RemindersService],
})
export class RemindersModule {}
