import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { InternalKeyGuard } from '@app/shared/guards/internal-key.guard';
import { CreateUserNotificationDto } from '../dto/create-user-notification.dto';
import { UserNotificationEntity } from '../entities/user-notification.entity';
import { NotificationsService } from '../services/notifications.service';

@Controller('internal/notifications')
@UseGuards(InternalKeyGuard)
@ApiExcludeController()
export class InternalNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() notification: CreateUserNotificationDto,
  ): Promise<UserNotificationEntity> {
    return this.notificationsService.create(notification);
  }
}
