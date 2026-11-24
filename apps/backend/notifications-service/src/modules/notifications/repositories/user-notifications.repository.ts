import { Injectable } from '@nestjs/common';
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
}
