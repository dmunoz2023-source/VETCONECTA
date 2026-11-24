import { Injectable } from '@nestjs/common';
import { RegisterDeviceDto } from '../dto/register-device.dto';
import { DeviceTokenEntity } from '../entities/device-token.entity';
import { DeviceTokensRepository } from '../repositories/device-tokens.repository';

@Injectable()
export class DevicesService {
  constructor(private readonly deviceTokens: DeviceTokensRepository) {}

  register(
    userId: string,
    device: RegisterDeviceDto,
  ): Promise<DeviceTokenEntity> {
    return this.deviceTokens.register(userId, device);
  }

  remove(userId: string, token: string): Promise<void> {
    return this.deviceTokens.remove(userId, token);
  }
}
