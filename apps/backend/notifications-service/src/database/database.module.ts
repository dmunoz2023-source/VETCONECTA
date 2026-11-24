import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceTokenEntity } from '../modules/devices/entities/device-token.entity';
import { UserNotificationEntity } from '../modules/notifications/entities/user-notification.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'vetconecta'),
        schema: 'notifications',
        entities: [DeviceTokenEntity, UserNotificationEntity],
        synchronize: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
