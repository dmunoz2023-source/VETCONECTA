import {Body, Controller, Delete, HttpCode, HttpStatus, Post, Query, UseGuards,
} from '@nestjs/common';
import { CancelRemindersQueryDto } from '../modules/reminders/dto/cancel-reminders-query.dto';
import { CreateReminderDto } from '../modules/reminders/dto/create-reminder.dto';
import { ReminderResponse } from '../modules/reminders/dto/reminder-response.dto';
import { RemindersService } from '../modules/reminders/services/reminders.service';
import { InternalKeyGuard } from './guards/internal-key.guard';

/**
 * [H1] Capa de presentación — rutas privadas entre servicios.
 * No se publican en el API Gateway; exigen X-Internal-Key.
 */
@Controller('internal/reminders')
@UseGuards(InternalKeyGuard)
export class RemindersInternalController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  schedule(@Body() dto: CreateReminderDto): Promise<ReminderResponse> {
    return this.remindersService.scheduleAppointmentReminder(dto);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  cancel(@Query() query: CancelRemindersQueryDto): Promise<{ cancelled: number }> {
    return this.remindersService.cancelByRef(query.type, query.refId);
  }
}