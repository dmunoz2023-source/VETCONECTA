import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DeviceToken } from '../modules/devices/entities/device-token.entity';
import { NotificationLog } from '../modules/reminders/entities/notification-log.entity';
import { ScheduledReminder } from '../modules/reminders/entities/scheduled-reminder.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('databaseUrl'),
        schema: configService.get<string>('dbSchema'),
        entities: [ScheduledReminder, NotificationLog, DeviceToken],
        synchronize: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
