import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalKeyGuard } from '@app/shared/guards/internal-key.guard';
import { InternalNotificationsController } from './controllers/internal-notifications.controller';
import { NotificationsController } from './controllers/notifications.controller';
import { UserNotificationEntity } from './entities/user-notification.entity';
import { UserNotificationsRepository } from './repositories/user-notifications.repository';
import { NotificationsService } from './services/notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserNotificationEntity])],
  controllers: [NotificationsController, InternalNotificationsController],
  providers: [
    NotificationsService,
    UserNotificationsRepository,
    InternalKeyGuard,
  ],
})
export class NotificationsModule {}
