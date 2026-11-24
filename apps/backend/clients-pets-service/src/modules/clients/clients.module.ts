import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { ClientsRepository } from './repositories/clients.repository';
import { ClientsService } from './services/clients.service';
import { PetsModule } from '../pets/pets.module';
import { ClientsController } from './controller/clients.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client]),
    forwardRef(() => PetsModule),
  ],
  controllers: [ClientsController],
  providers: [ClientsService, ClientsRepository],
  exports: [ClientsService, ClientsRepository],
})
export class ClientsModule {}