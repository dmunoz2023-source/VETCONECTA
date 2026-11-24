import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDeviceDto } from '../dto/register-device.dto';
import { DeviceTokenEntity } from '../entities/device-token.entity';

@Injectable()
export class DeviceTokensRepository {
  constructor(
    @InjectRepository(DeviceTokenEntity)
    private readonly repository: Repository<DeviceTokenEntity>,
  ) {}

  async register(
    userId: string,
    device: RegisterDeviceDto,
  ): Promise<DeviceTokenEntity> {
    await this.repository.upsert(
      {
        userId,
        token: device.token,
        platform: device.platform,
        active: true,
        lastUsedAt: new Date(),
      },
      ['token'],
    );

    const registeredDevice = await this.repository.findOneBy({
      token: device.token,
    });
    if (!registeredDevice) {
      throw new InternalServerErrorException(
        'No se pudo recuperar el dispositivo registrado.',
      );
    }

    return registeredDevice;
  }
}
