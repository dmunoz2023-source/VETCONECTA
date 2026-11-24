import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RegisterDeviceDto, DevicePlatform } from '../dto/register-device.dto';
import { DeviceTokenEntity } from '../entities/device-token.entity';
import { DeviceTokensRepository } from './device-tokens.repository';

describe('DeviceTokensRepository', () => {
  const repository = {
    upsert: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
  };
  const deviceTokens = new DeviceTokensRepository(
    repository as unknown as Repository<DeviceTokenEntity>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates or reassigns the unique token and reactivates it', async () => {
    const dto: RegisterDeviceDto = {
      token: 'fcm-registration-token',
      platform: DevicePlatform.IOS,
    };
    const savedDevice = {
      id: 'device-id',
      userId: 'authenticated-user-id',
      ...dto,
      active: true,
      lastUsedAt: new Date(),
    };
    repository.findOneBy.mockResolvedValue(savedDevice);

    await expect(
      deviceTokens.register('authenticated-user-id', dto),
    ).resolves.toBe(savedDevice);

    expect(repository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'authenticated-user-id',
        token: dto.token,
        platform: dto.platform,
        active: true,
        lastUsedAt: expect.any(Date),
      }),
      ['token'],
    );
    expect(repository.findOneBy).toHaveBeenCalledWith({ token: dto.token });
  });

  it('deletes only a token owned by the authenticated user', async () => {
    repository.delete.mockResolvedValue({ affected: 1 });

    await expect(
      deviceTokens.remove('authenticated-user-id', 'fcm-registration-token'),
    ).resolves.toBeUndefined();

    expect(repository.delete).toHaveBeenCalledWith({
      userId: 'authenticated-user-id',
      token: 'fcm-registration-token',
    });
  });

  it('returns 404 when the token is missing or belongs to another user', async () => {
    repository.delete.mockResolvedValue({ affected: 0 });

    await expect(
      deviceTokens.remove('authenticated-user-id', 'foreign-token'),
    ).rejects.toThrow(NotFoundException);

    expect(repository.delete).toHaveBeenCalledWith({
      userId: 'authenticated-user-id',
      token: 'foreign-token',
    });
  });
});
