import { INestApplication, ValidationPipe } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AddressInfo } from 'net';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { DevicePlatform } from '../devices/dto/register-device.dto';

jest.setTimeout(30000);

interface NotificationResponse {
  id: string;
  title: string;
  isRead: boolean;
}

describe('Notifications HTTP and PostgreSQL integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let baseUrl: string;
  let internalKey: string;
  let testUserIds: string[] = [];
  let testTokens: string[] = [];

  beforeAll(async () => {
    if (process.env.NOTIFICATIONS_INTEGRATION_TESTS !== '1') {
      throw new Error(
        'Set NOTIFICATIONS_INTEGRATION_TESTS=1 to explicitly enable PostgreSQL integration tests.',
      );
    }

    const { AppModule } = await import('../../app.module');
    const databaseName = process.env.DB_NAME;
    if (
      !process.env.NOTIFICATIONS_TEST_DB_NAME ||
      process.env.NOTIFICATIONS_TEST_DB_NAME !== databaseName
    ) {
      throw new Error(
        'Set NOTIFICATIONS_TEST_DB_NAME to exactly match DB_NAME; use an isolated test database.',
      );
    }

    internalKey = process.env.INTERNAL_API_KEY || process.env.INTERNAL_KEY || '';
    if (!internalKey) {
      throw new Error('The internal API key is required for integration tests.');
    }

    app = await NestFactory.create(AppModule);
    dataSource = app.get(DataSource);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.listen(0, '127.0.0.1');

    const address = app.getHttpServer().address() as AddressInfo | null;
    if (!address || typeof address === 'string') {
      await app.close();
      throw new Error('Could not determine the integration test server port.');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    if (dataSource?.isInitialized) {
      if (testUserIds.length > 0) {
        await dataSource.query(
          'DELETE FROM notifications.user_notifications WHERE user_id = ANY($1::uuid[])',
          [testUserIds],
        );
        const remainingNotifications = await dataSource.query(
          'SELECT id FROM notifications.user_notifications WHERE user_id = ANY($1::uuid[])',
          [testUserIds],
        );
        expect(remainingNotifications).toHaveLength(0);
      }
      if (testTokens.length > 0) {
        await dataSource.query(
          'DELETE FROM notifications.device_tokens WHERE token = ANY($1::varchar[])',
          [testTokens],
        );
        const remainingTokens = await dataSource.query(
          'SELECT token FROM notifications.device_tokens WHERE token = ANY($1::varchar[])',
          [testTokens],
        );
        expect(remainingTokens).toHaveLength(0);
      }
    }

    testUserIds = [];
    testTokens = [];
  });

  afterAll(async () => {
    await app?.close();
  });

  it('persists two device tokens and keeps the second when the first is removed', async () => {
    const userId = randomUUID();
    const firstToken = `integration-${randomUUID()}`;
    const secondToken = `integration-${randomUUID()}`;
    testUserIds.push(userId);
    testTokens.push(firstToken, secondToken);

    for (const token of [firstToken, secondToken]) {
      const response = await fetch(`${baseUrl}/v1/notifications/devices`, {
        method: 'POST',
        headers: {
          ...userHeaders(userId),
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          token,
          platform: DevicePlatform.ANDROID,
        }),
      });
      expect(response.status).toBe(201);
    }

    const beforeDelete = (await dataSource.query(
      'SELECT token FROM notifications.device_tokens WHERE user_id = $1 AND token = ANY($2::varchar[])',
      [userId, [firstToken, secondToken]],
    )) as Array<{ token: string }>;
    expect(beforeDelete.map(({ token }) => token).sort()).toEqual(
      [firstToken, secondToken].sort(),
    );

    const deleteResponse = await fetch(
      `${baseUrl}/v1/notifications/devices/${encodeURIComponent(firstToken)}`,
      {
        method: 'DELETE',
        headers: userHeaders(userId),
      },
    );
    expect(deleteResponse.status).toBe(204);

    const afterDelete = (await dataSource.query(
      'SELECT token FROM notifications.device_tokens WHERE user_id = $1 AND token = ANY($2::varchar[])',
      [userId, [firstToken, secondToken]],
    )) as Array<{ token: string }>;
    expect(afterDelete.map(({ token }) => token)).toEqual([secondToken]);
  });

  it('isolates notification listing and read updates between authenticated users', async () => {
    const firstUserId = randomUUID();
    const secondUserId = randomUUID();
    testUserIds.push(firstUserId, secondUserId);
    const marker = randomUUID();
    const firstTitle = `Integration notice A ${marker}`;
    const secondTitle = `Integration notice B ${marker}`;
    const notifications = [
      {
        userId: firstUserId,
        title: firstTitle,
        body: `Private notice for user A ${marker}`,
      },
      {
        userId: secondUserId,
        title: secondTitle,
        body: `Private notice for user B ${marker}`,
      },
    ];

    const ids: string[] = [];
    for (const notification of notifications) {
      const response = await fetch(
        `${baseUrl}/internal/notifications`,
        {
          method: 'POST',
          headers: {
            'x-internal-key': internalKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify(notification),
        },
      );
      expect(response.status).toBe(201);
      const created = (await response.json()) as NotificationResponse;
      ids.push(created.id);
      expect(created.isRead).toBe(false);
    }

    const firstUserResponse = await fetch(
      `${baseUrl}/v1/notifications?limit=50`,
      { headers: userHeaders(firstUserId) },
    );
    const firstUserPage = (await firstUserResponse.json()) as {
      items: NotificationResponse[];
    };
    expect(firstUserResponse.status).toBe(200);
    expect(firstUserPage.items.map(({ title }) => title)).toContain(firstTitle);
    expect(firstUserPage.items.map(({ title }) => title)).not.toContain(
      secondTitle,
    );

    const secondUserResponse = await fetch(
      `${baseUrl}/v1/notifications?limit=50`,
      { headers: userHeaders(secondUserId) },
    );
    const secondUserPage = (await secondUserResponse.json()) as {
      items: NotificationResponse[];
    };
    expect(secondUserResponse.status).toBe(200);
    expect(secondUserPage.items.map(({ title }) => title)).toContain(
      secondTitle,
    );
    expect(secondUserPage.items.map(({ title }) => title)).not.toContain(
      firstTitle,
    );

    const foreignReadResponse = await fetch(
      `${baseUrl}/v1/notifications/${ids[0]}/read`,
      {
        method: 'PATCH',
        headers: userHeaders(secondUserId),
      },
    );
    expect(foreignReadResponse.status).toBe(404);

    const ownerReadResponse = await fetch(
      `${baseUrl}/v1/notifications/${ids[0]}/read`,
      {
        method: 'PATCH',
        headers: userHeaders(firstUserId),
      },
    );
    expect(ownerReadResponse.status).toBe(200);
    const markedAsRead =
      (await ownerReadResponse.json()) as NotificationResponse;
    expect(markedAsRead.isRead).toBe(true);

    const persistedRows = (await dataSource.query(
      'SELECT id, user_id, is_read FROM notifications.user_notifications WHERE id = ANY($1::uuid[])',
      [ids],
    )) as Array<{ id: string; user_id: string; is_read: boolean }>;
    expect(persistedRows).toHaveLength(2);
    expect(
      persistedRows.find((row) => row.id === ids[0]),
    ).toMatchObject({ user_id: firstUserId, is_read: true });
    expect(
      persistedRows.find((row) => row.id === ids[1]),
    ).toMatchObject({ user_id: secondUserId, is_read: false });
  });
});

function userHeaders(userId: string): Record<string, string> {
  return {
    'x-user-id': userId,
    'x-user-role': 'owner',
  };
}
