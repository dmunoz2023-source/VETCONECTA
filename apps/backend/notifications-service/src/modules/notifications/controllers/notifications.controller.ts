import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { GetNotificationsQueryDto } from '../dto/get-notifications-query.dto';
import { NotificationsPageDto } from '../dto/notifications-page.dto';
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
}
