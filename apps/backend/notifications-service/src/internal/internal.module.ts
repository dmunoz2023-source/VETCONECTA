import { Module } from '@nestjs/common';
import { RemindersModule } from '../modules/reminders/reminders.module';
import { InternalKeyGuard } from './guards/internal-key.guard';
import { RemindersInternalController } from './reminders.internal.controller';

@Module({
  imports: [RemindersModule],
  controllers: [RemindersInternalController],
  providers: [InternalKeyGuard],
})
export class InternalModule {}