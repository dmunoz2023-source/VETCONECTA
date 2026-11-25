import { validateSync } from 'class-validator';
import { CreateUserNotificationDto } from './create-user-notification.dto';

describe('CreateUserNotificationDto', () => {
  it('accepts PostgreSQL UUID values with legacy version and variant bits', () => {
    const notification = Object.assign(new CreateUserNotificationDto(), {
      userId: '22222222-2222-5222-5222-222222222222',
      petId: '11111111-1111-4111-8111-111111111111',
      title: 'Próxima dosis',
      body: 'La próxima dosis está programada.',
    });

    expect(validateSync(notification)).toHaveLength(0);
  });
});
