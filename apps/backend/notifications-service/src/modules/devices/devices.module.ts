import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceToken } from './entities/device-token.entity';
import { DeviceTokensRepository } from './repositories/device-tokens.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceToken])],
  providers: [DeviceTokensRepository],
  exports: [DeviceTokensRepository],
})
export class DevicesModule {}
