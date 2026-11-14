import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { HistoryQueryDto } from '../dto/history-query.dto';
import { HistoryResponseDto } from '../dto/history-response.dto';
import { HistoryService } from '../services/history.service';

/**
 * [F3] GET /v1/clinical/pets/:petId/history: historial clínico consolidado de una
 * mascota (FR-8). El personal clínico consulta cualquier mascota; el dueño, solo las suyas.
 */
@ApiTags('historial')
@Controller('v1/clinical/pets')
@UseGuards(JwtHeadersGuard, RolesGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get(':petId/history')
  @Roles('owner', 'vet', 'reception', 'admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Historial clínico de una mascota',
    description:
      'Eventos clínicos de la mascota del más reciente al más antiguo, con el detalle de vacuna y ' +
      'los datos del veterinario, más sus citas pasadas con su estado. Admite filtros por tipo de ' +
      'evento y rango de fechas, y paginación de los eventos (page, limit). El personal clínico ' +
      've cualquier mascota; el dueño solo las suyas (BR-8, NFR-4).',
  })
  @ApiParam({ name: 'petId', format: 'uuid', description: 'Id de la mascota.' })
  @ApiOkResponse({ type: HistoryResponseDto, description: 'Historial paginado.' })
  @ApiBadRequestResponse({ description: 'Parámetros inválidos (id, filtros, paginación o rango de fechas).' })
  @ApiUnauthorizedResponse({ description: 'Faltan las cabeceras de autenticación del Gateway.' })
  @ApiForbiddenResponse({ description: 'El dueño intentó consultar una mascota que no le pertenece (o que no existe).' })
  @ApiServiceUnavailableResponse({ description: 'No se pudo verificar la mascota en el servicio de clientes.' })
  getHistory(
    @CurrentUser() user: JwtPayload,
    @Param('petId', ParseUUIDPipe) petId: string,
    @Query() query: HistoryQueryDto,
  ): Promise<HistoryResponseDto> {
    return this.historyService.getHistory(user, petId, query);
  }
}
