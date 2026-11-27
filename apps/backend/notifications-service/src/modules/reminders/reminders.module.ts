import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirebaseConfig } from '../../config/configuration';
import { DevicesModule } from '../devices/devices.module';
import { NotificationLog } from './entities/notification-log.entity';
import { ScheduledReminder } from './entities/scheduled-reminder.entity';
import { UserNotification } from './entities/user-notification.entity';
import { ReminderDispatchJob } from './jobs/reminder-dispatch.job';
import { FirebasePushSender } from './push/firebase-push-sender';
import { LogPushSender } from './push/log-push-sender';
import { PUSH_SENDER, PushSender } from './push/push-sender.interface';
import { NotificationLogRepository } from './repositories/notification-log.repository';
import { RemindersRepository } from './repositories/reminders.repository';
import { UserNotificationsRepository } from './repositories/user-notifications.repository';
import { ReminderDispatcherService } from './services/reminder-dispatcher.service';
import { RemindersService } from './services/reminders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduledReminder, NotificationLog, UserNotification]),
    DevicesModule,
  ],
  providers: [
    RemindersRepository,
    NotificationLogRepository,
    UserNotificationsRepository,
    RemindersService,
    ReminderDispatcherService,
    ReminderDispatchJob,
    {
      provide: PUSH_SENDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): PushSender => {
        const logger = new Logger('PushSender');
        const firebase = config.get<FirebaseConfig>('firebase');
        const missing = Object.entries({
          FIREBASE_PROJECT_ID: firebase?.projectId,
          FIREBASE_CLIENT_EMAIL: firebase?.clientEmail,
          FIREBASE_PRIVATE_KEY: firebase?.privateKey,
        })
          .filter(([, value]) => !value)
          .map(([name]) => name);

        if (firebase && missing.length === 0) {
          logger.log('Envío de push: Firebase (real)');
          return new FirebasePushSender(firebase);
        }
        if (missing.length < 3) {
          // Configuración a medias: mejor fallar al arrancar que enviar "simulado" sin saberlo.
          throw new Error(`Configuración de Firebase incompleta; faltan: ${missing.join(', ')}`);
        }
        logger.warn('Sin credencial de Firebase: envío de push SIMULADO (solo log)');
        return new LogPushSender();
      },
    },
  ],
  exports: [RemindersRepository, RemindersService],
})
export class RemindersModule {}