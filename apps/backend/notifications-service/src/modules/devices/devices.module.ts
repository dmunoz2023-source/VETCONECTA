import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesController } from './controllers/devices.controller';
import { DeviceTokenEntity } from './entities/device-token.entity';
import { DeviceTokensRepository } from './repositories/device-tokens.repository';
import { DevicesService } from './services/devices.service';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceTokenEntity])],
  controllers: [DevicesController],
  providers: [DevicesService, DeviceTokensRepository],
})
export class DevicesModule {}
