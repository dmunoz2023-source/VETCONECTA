import { UserNotification } from '../entities/user-notification.entity';
import { UserNotificationsRepository } from './user-notifications.repository';

describe('UserNotificationsRepository', () => {
  it('inserta el aviso con ON CONFLICT DO NOTHING (idempotente por reminder_id)', async () => {
    const qb = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({}),
    };
    const repo = { createQueryBuilder: jest.fn(() => qb) };
    const reminder = {
      id: 'r1',
      userId: 'u1',
      type: 'appointment',
      refId: 'a1',
      title: 'Recordatorio de cita',
      body: 'Tu cita',
    };

    await new UserNotificationsRepository(repo as any).createFromReminder(reminder as any);

    expect(qb.into).toHaveBeenCalledWith(UserNotification);
    expect(qb.values).toHaveBeenCalledWith({
      userId: 'u1',
      reminderId: 'r1',
      type: 'appointment',
      refId: 'a1',
      title: 'Recordatorio de cita',
      body: 'Tu cita',
    });
    expect(qb.orIgnore).toHaveBeenCalled();
    expect(qb.execute).toHaveBeenCalled();
  });
});