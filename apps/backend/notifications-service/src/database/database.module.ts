import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DeviceToken } from '../modules/devices/entities/device-token.entity';
import { NotificationLog } from '../modules/reminders/entities/notification-log.entity';
import { ScheduledReminder } from '../modules/reminders/entities/scheduled-reminder.entity';
import { UserNotification } from '../modules/reminders/entities/user-notification.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),

        schema: configService.get<string>('dbSchema'),
        entities: [ScheduledReminder, NotificationLog, DeviceToken, UserNotification],
        synchronize: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
