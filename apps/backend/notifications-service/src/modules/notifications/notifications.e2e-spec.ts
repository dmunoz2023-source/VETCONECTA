import { INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createHmac, randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { json } from 'express';
import { AddressInfo } from 'net';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AuthModule } from '../../../../api-gateway/src/auth/auth.module';
import { JwtAuthGuard } from '../../../../api-gateway/src/auth/jwt-auth.guard';
import { DevicePlatform } from '../devices/dto/register-device.dto';
import { setupNotificationsSwagger } from '../../swagger/setup-swagger';

jest.setTimeout(30000);

interface NotificationResponse {
  id: string;
  title: string;
  isRead: boolean;
}

interface NotificationsPage {
  items: NotificationResponse[];
  total: number;
  page: number;
  limit: number;
}

describe('Notifications HTTP and PostgreSQL integration', () => {
  let app: INestApplication;
  let jwtApp: INestApplication;
  let dataSource: DataSource;
  let baseUrl: string;
  let jwtUrl: string;
  let internalKey: string;
  let jwtSecret: string;
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
    jwtSecret = process.env.JWT_SECRET || '';
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is required for the gateway authentication tests.');
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
    setupNotificationsSwagger(app);
    await app.listen(0, '127.0.0.1');

    const address = app.getHttpServer().address() as AddressInfo | null;
    if (!address || typeof address === 'string') {
      await app.close();
      throw new Error('Could not determine the integration test server port.');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;

    class JwtAuthTestModule {}
    Module({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
      ],
    })(JwtAuthTestModule);

    jwtApp = await NestFactory.create(JwtAuthTestModule, {
      bodyParser: false,
    });
    const jwtGuard = jwtApp.get(JwtAuthGuard);
    jwtApp.use(json());
    jwtApp.use((request: Request, response: Response, next: NextFunction) => {
      jwtGuard.use(request, response, () => {
        forwardToNotifications(request, response, next, baseUrl);
      });
    });
    await jwtApp.listen(0, '127.0.0.1');

    const jwtAddress = jwtApp.getHttpServer().address() as AddressInfo | null;
    if (!jwtAddress || typeof jwtAddress === 'string') {
      await jwtApp.close();
      await app.close();
      throw new Error('Could not determine the JWT test server port.');
    }
    jwtUrl = `http://127.0.0.1:${jwtAddress.port}`;
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
    await jwtApp?.close();
    await app?.close();
  });

  it('persists two active platform-specific tokens and removes only the owned token', async () => {
    const userId = randomUUID();
    const firstToken = `integration-${randomUUID()}`;
    const secondToken = `integration-${randomUUID()}`;
    const oversizedToken = 'x'.repeat(256);
    const otherUserId = randomUUID();
    testUserIds.push(userId);
    testTokens.push(firstToken, secondToken, oversizedToken);

    for (const device of [
      { token: firstToken, platform: DevicePlatform.ANDROID },
      { token: secondToken, platform: DevicePlatform.IOS },
    ]) {
      const response = await fetch(`${jwtUrl}/v1/notifications/devices`, {
        method: 'POST',
        headers: {
          ...bearerHeaders(userId, jwtSecret),
          'content-type': 'application/json',
        },
        body: JSON.stringify(device),
      });
      expect(response.status).toBe(201);
    }

    const oversizedResponse = await fetch(
      `${jwtUrl}/v1/notifications/devices`,
      {
        method: 'POST',
        headers: {
          ...bearerHeaders(userId, jwtSecret),
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          token: oversizedToken,
          platform: DevicePlatform.ANDROID,
        }),
      },
    );
    expect(oversizedResponse.status).toBe(400);

    const beforeDelete = (await dataSource.query(
      'SELECT token, platform, active FROM notifications.device_tokens WHERE user_id = $1 AND token = ANY($2::varchar[])',
      [userId, [firstToken, secondToken]],
    )) as Array<{ token: string; platform: string; active: boolean }>;
    expect(beforeDelete).toEqual(
      expect.arrayContaining([
        { token: firstToken, platform: DevicePlatform.ANDROID, active: true },
        { token: secondToken, platform: DevicePlatform.IOS, active: true },
      ]),
    );

    const foreignDeleteResponse = await fetch(
      `${jwtUrl}/v1/notifications/devices/${encodeURIComponent(firstToken)}`,
      {
        method: 'DELETE',
        headers: bearerHeaders(otherUserId, jwtSecret),
      },
    );
    expect(foreignDeleteResponse.status).toBe(404);

    const afterForeignDelete = (await dataSource.query(
      'SELECT token FROM notifications.device_tokens WHERE user_id = $1 AND token = ANY($2::varchar[])',
      [userId, [firstToken, secondToken]],
    )) as Array<{ token: string }>;
    expect(afterForeignDelete).toHaveLength(2);

    const deleteResponse = await fetch(
      `${jwtUrl}/v1/notifications/devices/${encodeURIComponent(firstToken)}`,
      {
        method: 'DELETE',
        headers: bearerHeaders(userId, jwtSecret),
      },
    );
    expect(deleteResponse.status).toBe(204);

    const afterDelete = (await dataSource.query(
      'SELECT token, platform, active FROM notifications.device_tokens WHERE user_id = $1 AND token = ANY($2::varchar[])',
      [userId, [firstToken, secondToken]],
    )) as Array<{ token: string; platform: string; active: boolean }>;
    expect(afterDelete).toEqual([
      { token: secondToken, platform: DevicePlatform.IOS, active: true },
    ]);
  });

  it('filters and paginates persisted notifications and isolates authenticated users over HTTP', async () => {
    const firstUserId = randomUUID();
    const secondUserId = randomUUID();
    testUserIds.push(firstUserId, secondUserId);
    const marker = randomUUID();
    const petId = randomUUID();
    const otherPetId = randomUUID();
    const unreadNotifications = [1, 2, 3].map((number) => ({
      userId: firstUserId,
      petId,
      title: `Integration unread ${number} ${marker}`,
      body: `Unread notice ${number} ${marker}`,
    }));
    const readNotification = {
      userId: firstUserId,
      petId,
      title: `Integration already read ${marker}`,
      body: `Read notice ${marker}`,
    };
    const otherPetNotification = {
      userId: firstUserId,
      petId: otherPetId,
      title: `Integration other pet ${marker}`,
      body: `Other pet notice ${marker}`,
    };
    const secondUserNotification = {
      userId: secondUserId,
      petId,
      title: `Integration private to B ${marker}`,
      body: `Private notice for user B ${marker}`,
    };
    const notifications = [
      ...unreadNotifications,
      readNotification,
      otherPetNotification,
      secondUserNotification,
    ];

    const createdNotifications: NotificationResponse[] = [];
    for (const notification of notifications) {
      createdNotifications.push(
        await createInternalNotification(
          baseUrl,
          internalKey,
          notification,
        ),
      );
    }

    const readId = createdNotifications[3].id;
    const ownerReadResponse = await fetch(
      `${jwtUrl}/v1/notifications/${readId}/read`,
      {
        method: 'PATCH',
        headers: bearerHeaders(firstUserId, jwtSecret),
      },
    );
    expect(ownerReadResponse.status).toBe(200);
    expect(
      ((await ownerReadResponse.json()) as NotificationResponse).isRead,
    ).toBe(true);

    const firstUserResponse = await fetch(
      `${jwtUrl}/v1/notifications?limit=50`,
      {
        headers: {
          ...bearerHeaders(firstUserId, jwtSecret),
          'x-user-id': secondUserId,
          'x-user-role': 'vet',
        },
      },
    );
    const firstUserPage = (await firstUserResponse.json()) as NotificationsPage;
    expect(firstUserResponse.status).toBe(200);
    expect(firstUserPage.items.map(({ title }) => title)).toContain(
      unreadNotifications[0].title,
    );
    expect(firstUserPage.items.map(({ title }) => title)).not.toContain(
      secondUserNotification.title,
    );
    expect(firstUserPage.items.map(({ title }) => title)).toContain(
      otherPetNotification.title,
    );
    expect(firstUserPage.items.map(({ title }) => title)).toContain(
      readNotification.title,
    );

    const secondUserResponse = await fetch(
      `${jwtUrl}/v1/notifications?limit=50`,
      { headers: bearerHeaders(secondUserId, jwtSecret) },
    );
    const secondUserPage = (await secondUserResponse.json()) as NotificationsPage;
    expect(secondUserResponse.status).toBe(200);
    expect(secondUserPage.items.map(({ title }) => title)).toEqual([
      secondUserNotification.title,
    ]);

    const firstPageResponse = await fetch(
      `${jwtUrl}/v1/notifications?petId=${petId}&isRead=false&page=1&limit=2`,
      { headers: bearerHeaders(firstUserId, jwtSecret) },
    );
    const firstFilteredPage =
      (await firstPageResponse.json()) as NotificationsPage;
    expect(firstPageResponse.status).toBe(200);
    expect(firstFilteredPage).toMatchObject({
      total: 3,
      page: 1,
      limit: 2,
    });
    expect(firstFilteredPage.items).toHaveLength(2);

    const secondPageResponse = await fetch(
      `${jwtUrl}/v1/notifications?petId=${petId}&isRead=false&page=2&limit=2`,
      { headers: bearerHeaders(firstUserId, jwtSecret) },
    );
    const secondFilteredPage =
      (await secondPageResponse.json()) as NotificationsPage;
    expect(secondPageResponse.status).toBe(200);
    expect(secondFilteredPage).toMatchObject({
      total: 3,
      page: 2,
      limit: 2,
    });
    expect(secondFilteredPage.items).toHaveLength(1);

    const expectedOrder = (await dataSource.query(
      'SELECT id FROM notifications.user_notifications WHERE user_id = $1 AND pet_id = $2 AND is_read = FALSE ORDER BY created_at DESC',
      [firstUserId, petId],
    )) as Array<{ id: string }>;
    expect([
      ...firstFilteredPage.items,
      ...secondFilteredPage.items,
    ].map(({ id }) => id)).toEqual(expectedOrder.map(({ id }) => id));

    const readFilterResponse = await fetch(
      `${jwtUrl}/v1/notifications?petId=${petId}&isRead=true&page=1&limit=5`,
      { headers: bearerHeaders(firstUserId, jwtSecret) },
    );
    const readFilteredPage =
      (await readFilterResponse.json()) as NotificationsPage;
    expect(readFilterResponse.status).toBe(200);
    expect(readFilteredPage.total).toBe(1);
    expect(readFilteredPage.items.map(({ id }) => id)).toEqual([readId]);

    const foreignReadResponse = await fetch(
      `${jwtUrl}/v1/notifications/${createdNotifications[0].id}/read`,
      {
        method: 'PATCH',
        headers: bearerHeaders(secondUserId, jwtSecret),
      },
    );
    expect(foreignReadResponse.status).toBe(404);

    const ownReadResponse = await fetch(
      `${jwtUrl}/v1/notifications/${createdNotifications[0].id}/read`,
      {
        method: 'PATCH',
        headers: bearerHeaders(firstUserId, jwtSecret),
      },
    );
    expect(ownReadResponse.status).toBe(200);
    expect(((await ownReadResponse.json()) as NotificationResponse).isRead).toBe(
      true,
    );

    const persistedRows = (await dataSource.query(
      'SELECT id, user_id, is_read FROM notifications.user_notifications WHERE id = ANY($1::uuid[])',
      [createdNotifications.map(({ id }) => id)],
    )) as Array<{ id: string; user_id: string; is_read: boolean }>;
    expect(persistedRows).toHaveLength(notifications.length);
    expect(
      persistedRows.find((row) => row.id === createdNotifications[0].id),
    ).toMatchObject({ user_id: firstUserId, is_read: true });
    expect(
      persistedRows.find((row) => row.id === createdNotifications[3].id),
    ).toMatchObject({ user_id: firstUserId, is_read: true });
    expect(
      persistedRows.find(
        (row) => row.id === createdNotifications[5].id,
      ),
    ).toMatchObject({ user_id: secondUserId, is_read: false });
  });

  it('publishes all four public endpoints in the OpenAPI JSON', async () => {
    const response = await fetch(`${baseUrl}/docs-json`);
    expect(response.status).toBe(200);
    const document = (await response.json()) as {
      paths: Record<string, Record<string, unknown>>;
    };

    expect(document.paths['/v1/notifications/devices'].post).toBeDefined();
    expect(
      document.paths['/v1/notifications/devices/{token}'].delete,
    ).toBeDefined();
    expect(document.paths['/v1/notifications'].get).toBeDefined();
    expect(
      document.paths['/v1/notifications/{id}/read'].patch,
    ).toBeDefined();
    expect(document.paths['/internal/notifications']).toBeUndefined();
  });
});

async function createInternalNotification(
  baseUrl: string,
  internalKey: string,
  notification: {
    userId: string;
    petId?: string;
    title: string;
    body: string;
  },
): Promise<NotificationResponse> {
  const response = await fetch(`${baseUrl}/internal/notifications`, {
    method: 'POST',
    headers: {
      'x-internal-key': internalKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(notification),
  });
  expect(response.status).toBe(201);
  const created = (await response.json()) as NotificationResponse;
  expect(created.isRead).toBe(false);
  return created;
}

function bearerHeaders(userId: string, secret: string): Record<string, string> {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  ).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      role: 'owner',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60,
    }),
  ).toString('base64url');
  const unsignedToken = `${header}.${payload}`;
  const signature = createHmac('sha256', secret)
    .update(unsignedToken)
    .digest('base64url');

  return { authorization: `Bearer ${unsignedToken}.${signature}` };
}

function forwardToNotifications(
  request: Request,
  response: Response,
  next: NextFunction,
  notificationsUrl: string,
): void {
  const headers: Record<string, string> = {};
  for (const headerName of ['x-user-id', 'x-user-role']) {
    const headerValue = request.headers[headerName];
    if (typeof headerValue === 'string') {
      headers[headerName] = headerValue;
    }
  }
  if (typeof request.headers['content-type'] === 'string') {
    headers['content-type'] = request.headers['content-type'];
  }

  const hasBody = ['POST', 'PATCH', 'PUT'].includes(request.method);
  const body = hasBody ? JSON.stringify(request.body ?? {}) : undefined;
  void fetch(new URL(request.originalUrl, notificationsUrl), {
    method: request.method,
    headers,
    body,
  })
    .then(async (upstreamResponse) => {
      const contentType = upstreamResponse.headers.get('content-type');
      if (contentType) {
        response.setHeader('content-type', contentType);
      }
      response
        .status(upstreamResponse.status)
        .send(await upstreamResponse.text());
    })
    .catch(next);
}
