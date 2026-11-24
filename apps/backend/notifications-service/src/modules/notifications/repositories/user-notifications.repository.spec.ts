import { Repository } from 'typeorm';
import { GetNotificationsQueryDto } from '../dto/get-notifications-query.dto';
import { UserNotificationEntity } from '../entities/user-notification.entity';
import { UserNotificationsRepository } from './user-notifications.repository';

describe('UserNotificationsRepository', () => {
  const repository = {
    findAndCount: jest.fn(),
  };
  const notifications = new UserNotificationsRepository(
    repository as unknown as Repository<UserNotificationEntity>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('scopes results to the user and applies filters, ordering, and pagination', async () => {
    const query: GetNotificationsQueryDto = {
      page: 2,
      limit: 5,
      petId: '11111111-1111-4111-8111-111111111111',
      isRead: false,
    };
    repository.findAndCount.mockResolvedValue([[], 0]);

    await notifications.findForUser('authenticated-user-id', query);

    expect(repository.findAndCount).toHaveBeenCalledWith({
      where: {
        userId: 'authenticated-user-id',
        petId: query.petId,
        isRead: false,
      },
      order: { createdAt: 'DESC' },
      skip: 5,
      take: 5,
    });
  });

  it('always scopes results to the user when optional filters are absent', async () => {
    repository.findAndCount.mockResolvedValue([[], 0]);

    await notifications.findForUser('authenticated-user-id', {
      page: 1,
      limit: 10,
    });

    expect(repository.findAndCount).toHaveBeenCalledWith({
      where: { userId: 'authenticated-user-id' },
      order: { createdAt: 'DESC' },
      skip: 0,
      take: 10,
    });
  });
});
