import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GetNotificationsQueryDto } from './get-notifications-query.dto';

describe('GetNotificationsQueryDto', () => {
  it('uses the default page and page size when omitted', async () => {
    const query = plainToInstance(GetNotificationsQueryDto, {});

    expect(query).toMatchObject({ page: 1, limit: 10 });
    await expect(validate(query)).resolves.toHaveLength(0);
  });

  it('converts numeric and boolean query values, preserving false', async () => {
    const query = plainToInstance(GetNotificationsQueryDto, {
      page: '2',
      limit: '5',
      isRead: 'false',
      petId: '11111111-1111-4111-8111-111111111111',
    });

    expect(query).toMatchObject({
      page: 2,
      limit: 5,
      isRead: false,
    });
    await expect(validate(query)).resolves.toHaveLength(0);
  });

  it('rejects invalid pagination and boolean query values', async () => {
    const query = plainToInstance(GetNotificationsQueryDto, {
      page: '0',
      limit: '51',
      isRead: 'sometimes',
    });

    await expect(validate(query)).resolves.toHaveLength(3);
  });
});
