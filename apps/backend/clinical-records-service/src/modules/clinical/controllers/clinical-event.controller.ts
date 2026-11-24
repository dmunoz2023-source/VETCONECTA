import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { ClinicalEventService } from '../services/clinical-event.service';
import {
  CreateClinicalEventDto,
  UpdateClinicalEventDto,
} from '../dto/create-clinical-event.dto';
import { GetClinicalHistoryQueryDto } from '../dto/get-clinical-history-query.dto';
import { ClinicalEventEntity } from '../entities/clinical-event.entity';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';

@Controller('v1/clinical')
@ApiTags('clinical-events')
@ApiBearerAuth()
@UseGuards(JwtHeadersGuard, RolesGuard)
export class ClinicalEventController {
  constructor(private readonly clinicalEventService: ClinicalEventService) {}

  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  @Roles('vet')
  @ApiOperation({ summary: 'Registrar un evento clínico' })
  @ApiCreatedResponse({ description: 'Evento clínico creado.' })
  @ApiBadRequestResponse({ description: 'Datos obligatorios faltantes o inválidos.' })
  @ApiForbiddenResponse({ description: 'Solo veterinarios pueden registrar eventos.' })
  @ApiNotFoundResponse({ description: 'No existe la mascota indicada.' })
  @ApiServiceUnavailableResponse({ description: 'No se pudo verificar la mascota.' })
  @ApiUnauthorizedResponse({ description: 'Falta autenticación válida.' })
  async create(
    @Body() createClinicalEventDto: CreateClinicalEventDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ClinicalEventEntity> {
    return this.clinicalEventService.create(createClinicalEventDto, user.sub);
  }

  @Put('events/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('vet', 'admin')
  @ApiOperation({ summary: 'Editar un evento clínico' })
  @ApiParam({ name: 'id', description: 'UUID del evento clínico' })
  @ApiOkResponse({ description: 'Evento clínico actualizado.' })
  @ApiBadRequestResponse({ description: 'Datos inválidos o mascota modificada.' })
  @ApiForbiddenResponse({ description: 'Solo el veterinario autor o un administrador pueden editar.' })
  @ApiNotFoundResponse({ description: 'No se encontró el evento clínico.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClinicalEventDto: UpdateClinicalEventDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ClinicalEventEntity> {
    return this.clinicalEventService.update(
      id,
      updateClinicalEventDto,
      user,
    );
  }

  @Get('pets/:petId/carnet')
  @HttpCode(HttpStatus.OK)
  @Roles('owner', 'vet', 'reception')
  @ApiOperation({ summary: 'Obtener carnet clínico de una mascota' })
  @ApiParam({ name: 'petId', description: 'UUID de la mascota' })
  @ApiOkResponse({ description: 'Eventos clínicos de la mascota.' })
  @ApiForbiddenResponse({ description: 'El dueño no tiene acceso a esta mascota.' })
  async getCarnet(
    @Param('petId', ParseUUIDPipe) petId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ClinicalEventEntity[]> {
    return this.clinicalEventService.findByPetId(petId, user);
  }

  @Get('pets/:petId/history')
  @HttpCode(HttpStatus.OK)
  @Roles('vet', 'reception')
  @ApiOperation({ summary: 'Obtener historial clínico paginado' })
  @ApiParam({ name: 'petId', description: 'UUID de la mascota' })
  @ApiOkResponse({ description: 'Eventos clínicos y metadatos de paginación.' })
  @ApiForbiddenResponse({ description: 'Rol sin permiso para consultar el historial.' })
  async getHistory(
    @Param('petId', ParseUUIDPipe) petId: string,
    @Query() query: GetClinicalHistoryQueryDto,
  ) {
    return this.clinicalEventService.findHistoryByPetId(petId, query);
  }
}