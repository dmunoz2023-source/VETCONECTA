import { Injectable } from '@nestjs/common';
import { GetNotificationsQueryDto } from '../dto/get-notifications-query.dto';
import { NotificationsPageDto } from '../dto/notifications-page.dto';
import { UserNotificationsRepository } from '../repositories/user-notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly userNotifications: UserNotificationsRepository,
  ) {}

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
}
