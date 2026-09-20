import { Module } from '@nestjs/common';
import { PetsModule } from './modules/pets/pets.modules';
@Module({
  imports: [PetsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}