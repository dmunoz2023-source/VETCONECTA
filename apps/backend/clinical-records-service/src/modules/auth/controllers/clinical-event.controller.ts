import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClinicalEventService } from '../services/clinical-event.service';
import { CreateClinicalEventDto } from '../dto/create-clinical-event.dto';
import { ClinicalEventEntity } from '../entities/clinical-event.entity';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';

@Controller('v1/clinical/clinical-event')
@UseGuards(JwtHeadersGuard, RolesGuard)
export class ClinicalEventController {
  constructor(private readonly clinicalEventService: ClinicalEventService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('vet')
  async create(
    @Body() createClinicalEventDto: CreateClinicalEventDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ClinicalEventEntity> {
    return this.clinicalEventService.create(createClinicalEventDto, user.sub);
  }
}