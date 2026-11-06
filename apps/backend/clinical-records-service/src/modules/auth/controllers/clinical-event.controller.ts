import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClinicalEventService } from '../services/clinical-event.service';
import { CreateClinicalEventDto } from '../dto/create-clinical-event.dto';
import { GetClinicalHistoryQueryDto } from '../dto/get-clinical-history-query.dto';
import { ClinicalEventEntity } from '../entities/clinical-event.entity';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';

@Controller('v1/clinical')
@UseGuards(JwtHeadersGuard, RolesGuard)
export class ClinicalEventController {
  constructor(private readonly clinicalEventService: ClinicalEventService) {}

  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  @Roles('vet')
  async create(
    @Body() createClinicalEventDto: CreateClinicalEventDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ClinicalEventEntity> {
    return this.clinicalEventService.create(createClinicalEventDto, user.sub);
  }

  @Get('pets/:petId/carnet')
  @HttpCode(HttpStatus.OK)
  @Roles('owner', 'vet', 'reception')
  async getCarnet(
    @Param('petId', ParseUUIDPipe) petId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ClinicalEventEntity[]> {
    return this.clinicalEventService.findByPetId(petId, user);
  }

  @Get('pets/:petId/history')
  @HttpCode(HttpStatus.OK)
  @Roles('vet', 'reception')
  async getHistory(
    @Param('petId', ParseUUIDPipe) petId: string,
    @Query() query: GetClinicalHistoryQueryDto,
  ) {
    return this.clinicalEventService.findHistoryByPetId(petId, query);
  }
}