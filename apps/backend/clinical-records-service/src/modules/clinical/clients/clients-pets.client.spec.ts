import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { ClientsPetsClient } from './clients-pets.client';

describe('ClientsPetsClient', () => {
  it('resolves the user who owns a pet through the internal endpoint', async () => {
    const httpService = {
      get: jest
        .fn()
        .mockReturnValue(
          of({
            status: 200,
            data: { userId: '22222222-2222-4222-8222-222222222222' },
          } as AxiosResponse),
        ),
    };
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'internalApiKey') return 'internal-test-key';
        if (key === 'clientsServiceUrl') return 'http://localhost:3002/';
        return undefined;
      }),
    };
    const client = new ClientsPetsClient(
      httpService as unknown as HttpService,
      configService as unknown as ConfigService,
    );

    await expect(
      client.getPetOwnerId('11111111-1111-4111-8111-111111111111'),
    ).resolves.toBe('22222222-2222-4222-8222-222222222222');

    expect(httpService.get).toHaveBeenCalledWith(
      'http://localhost:3002/internal/pets/11111111-1111-4111-8111-111111111111/owner',
      expect.objectContaining({
        headers: { 'X-Internal-Key': 'internal-test-key' },
        validateStatus: expect.any(Function),
      }),
    );
  });
});
