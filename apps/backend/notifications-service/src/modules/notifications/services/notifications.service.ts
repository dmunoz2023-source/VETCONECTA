import { Injectable } from '@nestjs/common';
import { CreateUserNotificationDto } from '../dto/create-user-notification.dto';
import { GetNotificationsQueryDto } from '../dto/get-notifications-query.dto';
import { NotificationsPageDto } from '../dto/notifications-page.dto';
import { UserNotificationsRepository } from '../repositories/user-notifications.repository';
import { UserNotificationEntity } from '../entities/user-notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly userNotifications: UserNotificationsRepository,
  ) {}

  create(
    notification: CreateUserNotificationDto,
  ): Promise<UserNotificationEntity> {
    return this.userNotifications.create(notification);
  }

  async findForUser(
    userId: string,
    query: GetNotificationsQueryDto,
  ): Promise<NotificationsPageDto> {
    const [items, total] = await this.userNotifications.findForUser(
      userId,
      query,
    );

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<UserNotificationEntity> {
    return this.userNotifications.markAsRead(userId, notificationId);
  }
}
