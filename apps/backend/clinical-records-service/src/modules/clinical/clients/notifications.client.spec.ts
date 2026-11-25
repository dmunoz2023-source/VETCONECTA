import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { CreateUserNotificationPayload, NotificationsClient } from './notifications.client';

describe('NotificationsClient', () => {
  it('posts the notification to the internal notifications endpoint', async () => {
    const httpService = {
      post: jest.fn().mockReturnValue(of({ status: 201 } as AxiosResponse)),
    };
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'internalApiKey') return 'internal-test-key';
        if (key === 'notificationsServiceUrl') {
          return 'http://localhost:3005/';
        }
        return undefined;
      }),
    };
    const client = new NotificationsClient(
      httpService as unknown as HttpService,
      configService as unknown as ConfigService,
    );
    const notification: CreateUserNotificationPayload = {
      userId: '22222222-2222-4222-8222-222222222222',
      petId: '11111111-1111-4111-8111-111111111111',
      title: 'Próxima dosis de Rabia',
      body: 'La próxima dosis está programada para el 2027-01-15.',
    };

    await expect(client.create(notification)).resolves.toBeUndefined();

    expect(httpService.post).toHaveBeenCalledWith(
      'http://localhost:3005/internal/notifications',
      notification,
      expect.objectContaining({
        headers: { 'X-Internal-Key': 'internal-test-key' },
        validateStatus: expect.any(Function),
      }),
    );
  });
});
