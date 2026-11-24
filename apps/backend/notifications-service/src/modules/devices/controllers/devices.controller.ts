import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { RegisterDeviceDto } from '../dto/register-device.dto';
import { DeviceTokenEntity } from '../entities/device-token.entity';
import { DevicesService } from '../services/devices.service';

@Controller('v1/notifications/devices')
@ApiTags('devices')
@ApiBearerAuth()
@UseGuards(JwtHeadersGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Vincular un token FCM al usuario autenticado' })
  @ApiCreatedResponse({ type: DeviceTokenEntity })
  @ApiBadRequestResponse({ description: 'El token o la plataforma no son válidos.' })
  @ApiUnauthorizedResponse({ description: 'Falta autenticación válida.' })
  register(
    @Body() device: RegisterDeviceDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<DeviceTokenEntity> {
    return this.devicesService.register(user.sub, device);
  }
}
