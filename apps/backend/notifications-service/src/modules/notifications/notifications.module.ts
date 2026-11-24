import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './controllers/notifications.controller';
import { UserNotificationEntity } from './entities/user-notification.entity';
import { UserNotificationsRepository } from './repositories/user-notifications.repository';
import { NotificationsService } from './services/notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserNotificationEntity])],
  controllers: [NotificationsController],
  providers: [NotificationsService, UserNotificationsRepository],
})
export class NotificationsModule {}
