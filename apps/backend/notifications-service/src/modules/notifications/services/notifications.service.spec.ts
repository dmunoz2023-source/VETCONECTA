import { GetNotificationsQueryDto } from '../dto/get-notifications-query.dto';
import { UserNotificationEntity } from '../entities/user-notification.entity';
import { UserNotificationsRepository } from '../repositories/user-notifications.repository';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  const repository = {
    findForUser: jest.fn(),
  };
  const service = new NotificationsService(
    repository as unknown as UserNotificationsRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns items and pagination metadata from the user-scoped query', async () => {
    const query: GetNotificationsQueryDto = {
      page: 2,
      limit: 5,
    };
    const items = [{ id: 'notification-id' }] as UserNotificationEntity[];
    repository.findForUser.mockResolvedValue([items, 11]);

    await expect(
      service.findForUser('authenticated-user-id', query),
    ).resolves.toEqual({
      items,
      total: 11,
      page: 2,
      limit: 5,
    });

    expect(repository.findForUser).toHaveBeenCalledWith(
      'authenticated-user-id',
      query,
    );
  });
});
