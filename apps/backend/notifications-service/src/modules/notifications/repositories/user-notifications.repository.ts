import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { GetNotificationsQueryDto } from '../dto/get-notifications-query.dto';
import { UserNotificationEntity } from '../entities/user-notification.entity';

@Injectable()
export class UserNotificationsRepository {
  constructor(
    @InjectRepository(UserNotificationEntity)
    private readonly repository: Repository<UserNotificationEntity>,
  ) {}

  findForUser(
    userId: string,
    query: GetNotificationsQueryDto,
  ): Promise<[UserNotificationEntity[], number]> {
    const where: FindOptionsWhere<UserNotificationEntity> = { userId };
    if (query.petId !== undefined) {
      where.petId = query.petId;
    }
    if (query.isRead !== undefined) {
      where.isRead = query.isRead;
    }

    return this.repository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
  }

  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<UserNotificationEntity> {
    const result = await this.repository.update(
      { id: notificationId, userId },
      { isRead: true, readAt: new Date() },
    );
    if (!result.affected) {
      throw new NotFoundException('No se encontró la notificación.');
    }

    const notification = await this.repository.findOneBy({
      id: notificationId,
      userId,
    });
    if (!notification) {
      throw new NotFoundException('No se encontró la notificación.');
    }

    return notification;
  }
}
