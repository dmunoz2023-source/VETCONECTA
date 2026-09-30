import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { ClientsRepository } from './repositories/clients.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Client])],
  providers: [ClientsRepository],
  exports: [ClientsRepository],
})
export class ClientsModule {}
