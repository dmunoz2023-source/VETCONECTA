import { Repository } from 'typeorm';
import { GetNotificationsQueryDto } from '../dto/get-notifications-query.dto';
import { UserNotificationEntity } from '../entities/user-notification.entity';
import { UserNotificationsRepository } from './user-notifications.repository';

describe('UserNotificationsRepository', () => {
  const repository = {
    findAndCount: jest.fn(),
    update: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn((entity) => entity),
    save: jest.fn(),
  };
  const notifications = new UserNotificationsRepository(
    repository as unknown as Repository<UserNotificationEntity>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists new notifications as unread records', async () => {
    const notification = {
      userId: 'authenticated-user-id',
      title: 'Recordatorio',
      body: 'La vacuna de tu mascota está próxima.',
    };
    const savedNotification = {
      id: 'notification-id',
      ...notification,
      petId: null,
      isRead: false,
      readAt: null,
    };
    const newNotification = {
      ...notification,
      petId: null,
      isRead: false,
      readAt: null,
    };
    repository.save.mockResolvedValue(savedNotification);

    await expect(notifications.create(notification)).resolves.toBe(
      savedNotification,
    );

    expect(repository.create).toHaveBeenCalledWith({
      ...notification,
      petId: null,
      isRead: false,
      readAt: null,
    });
    expect(repository.save).toHaveBeenCalledWith(newNotification);
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

  it('marks a notification as read only for its owner', async () => {
    const notification = {
      id: '22222222-2222-4222-8222-222222222222',
      userId: 'authenticated-user-id',
      isRead: true,
      readAt: new Date(),
    } as UserNotificationEntity;
    repository.update.mockResolvedValue({ affected: 1 });
    repository.findOneBy.mockResolvedValue(notification);

    await expect(
      notifications.markAsRead(
        'authenticated-user-id',
        notification.id,
      ),
    ).resolves.toBe(notification);

    expect(repository.update).toHaveBeenCalledWith(
      { id: notification.id, userId: 'authenticated-user-id' },
      { isRead: true, readAt: expect.any(Date) },
    );
    expect(repository.findOneBy).toHaveBeenCalledWith({
      id: notification.id,
      userId: 'authenticated-user-id',
    });
  });

  it('returns 404 without reading a notification owned by another user', async () => {
    repository.update.mockResolvedValue({ affected: 0 });

    await expect(
      notifications.markAsRead(
        'authenticated-user-id',
        '33333333-3333-4333-8333-333333333333',
      ),
    ).rejects.toMatchObject({ status: 404 });

    expect(repository.update).toHaveBeenCalledWith(
      {
        id: '33333333-3333-4333-8333-333333333333',
        userId: 'authenticated-user-id',
      },
      { isRead: true, readAt: expect.any(Date) },
    );
    expect(repository.findOneBy).not.toHaveBeenCalled();
  });
});
