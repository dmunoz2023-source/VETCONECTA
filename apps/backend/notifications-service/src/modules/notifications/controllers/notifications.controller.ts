import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { GetNotificationsQueryDto } from '../dto/get-notifications-query.dto';
import { NotificationsPageDto } from '../dto/notifications-page.dto';
import { UserNotificationEntity } from '../entities/user-notification.entity';
import { NotificationsService } from '../services/notifications.service';

@Controller('v1/notifications')
@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtHeadersGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar avisos del usuario autenticado' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página (mínimo 1).',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Elementos por página (entre 1 y 50).',
  })
  @ApiQuery({
    name: 'petId',
    required: false,
    type: String,
    description: 'UUID de la mascota.',
  })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean })
  @ApiOkResponse({ type: NotificationsPageDto })
  @ApiBadRequestResponse({ description: 'Los filtros de consulta no son válidos.' })
  @ApiUnauthorizedResponse({ description: 'Falta autenticación válida.' })
  findForUser(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetNotificationsQueryDto,
  ): Promise<NotificationsPageDto> {
    return this.notificationsService.findForUser(user.sub, query);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  @ApiParam({ name: 'id', description: 'UUID de la notificación' })
  @ApiOkResponse({ type: UserNotificationEntity })
  @ApiBadRequestResponse({ description: 'El ID debe ser un UUID válido.' })
  @ApiNotFoundResponse({
    description: 'La notificación no existe o no pertenece al usuario autenticado.',
  })
  @ApiUnauthorizedResponse({ description: 'Falta autenticación válida.' })
  markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserNotificationEntity> {
    return this.notificationsService.markAsRead(user.sub, id);
  }
}
