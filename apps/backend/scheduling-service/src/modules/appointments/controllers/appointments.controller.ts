import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ERROR_RESPONSE_SCHEMA } from '@app/shared/swagger/error-response.schema';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { AppointmentsService } from '../services/appointments.service';
import { GetCitasQueryDto } from '../dto/get-citas-query.dto';
import { CreateCitaDto } from '../dto/create-cita.dto';
import { UpdateEstadoDto } from '../dto/update-estado.dto';

/**
 * [C3] GET /v1/scheduling/appointments/me — el dueño consulta sus propias citas agendadas,
 * historicas y canceladas (FR-3, BR-8). Requiere las cabeceras del
 * Gateway (JwtHeadersGuard) y esta reservado al rol owner (RolesGuard).
 */
@ApiTags('appointments')
@Controller('v1/scheduling/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('me')
  @UseGuards(JwtHeadersGuard, RolesGuard)
  @Roles('owner')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar mis citas',
    description:
      'Solo owner. Devuelve las citas del dueño autenticado (agendadas, históricas y ' +
      'canceladas), con filtro opcional por estado y paginación (FR-3, BR-8).',
  })
  @ApiOkResponse({ description: 'Listado de citas del dueño.' })
  @ApiBadRequestResponse({ description: 'VALIDATION_ERROR: filtros o paginación inválidos.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o expiró.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiForbiddenResponse({ description: 'FORBIDDEN: el rol no es owner o no tiene client_id (BR-8, BR-14).', schema: ERROR_RESPONSE_SCHEMA })
  async getMyCitas(@CurrentUser() user: JwtPayload, @Query() query: GetCitasQueryDto) {
    return this.appointmentsService.findMyCitas(user.clientId, query);
  }

  /**
   * [G2] POST /v1/scheduling/appointments — reserva una hora (FR-3, BR-5). El dueño solo puede
   * reservar para sus mascotas (BR-8); recepcion y admin para cualquiera.
   */
  @Post()
  @UseGuards(JwtHeadersGuard, RolesGuard)
  @Roles('owner', 'reception', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reservar una hora', description: 'Roles: owner, reception, admin. Valida la mascota, el veterinario y el bloque dentro de una transacción con bloqueo de fila; programa el recordatorio de 24 h después del commit (FR-3, BR-4, BR-5, BR-7, BR-9).' })
  @ApiCreatedResponse({ description: 'Cita reservada.' })
  @ApiBadRequestResponse({ description: 'VALIDATION_ERROR: cuerpo inválido o fecha pasada.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o expiró.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiForbiddenResponse({ description: 'FORBIDDEN: el usuario no tiene client_id o la mascota no es suya (BR-8).', schema: ERROR_RESPONSE_SCHEMA })
  @ApiNotFoundResponse({ description: 'NOT_FOUND: la mascota no existe o el veterinario no tiene un bloque disponible a esa hora.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiConflictResponse({ description: 'CONFLICT: el horario ya fue reservado por otra persona (BR-5).', schema: ERROR_RESPONSE_SCHEMA })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCitaDto) {
    return this.appointmentsService.create(user, dto);
  }

  /** [G2] PATCH /v1/scheduling/appointments/:id/cancel — cancela y libera el horario. */
  @Patch(':id/cancel')
  @UseGuards(JwtHeadersGuard, RolesGuard)
  @Roles('owner', 'reception', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancelar una cita', description: 'Roles: owner (solo las suyas), reception, admin. Libera el horario y anula el recordatorio asociado (BR-7, BR-9).' })
  @ApiParam({ name: 'id', description: 'UUID de la cita.' })
  @ApiOkResponse({ description: 'Cita cancelada.' })
  @ApiBadRequestResponse({ description: 'VALIDATION_ERROR: la cita ya comenzó y no se puede cancelar.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o expiró.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiForbiddenResponse({ description: 'FORBIDDEN: la cita no pertenece al dueño (BR-8).', schema: ERROR_RESPONSE_SCHEMA })
  @ApiNotFoundResponse({ description: 'NOT_FOUND: la cita no existe.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiConflictResponse({ description: 'CONFLICT: la cita ya no se puede cancelar (ya cancelada o realizada).', schema: ERROR_RESPONSE_SCHEMA })
  async cancel(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.cancel(user, id);
  }

  /** [G2] PATCH /v1/scheduling/appointments/:id/status — marca la cita como atendida o inasistente. */
  @Patch(':id/status')
  @UseGuards(JwtHeadersGuard, RolesGuard)
  @Roles('vet', 'reception', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar una cita como realizada o no asistida', description: 'Roles: vet, reception, admin. completed habilita la calificación de la cita (BR-9, BR-13).' })
  @ApiParam({ name: 'id', description: 'UUID de la cita.' })
  @ApiOkResponse({ description: 'Cita actualizada.' })
  @ApiBadRequestResponse({ description: 'VALIDATION_ERROR: status debe ser completed o no_show.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o expiró.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiForbiddenResponse({ description: 'FORBIDDEN: el rol no puede cambiar el estado (BR-14) o un veterinario intenta actualizar la cita de otro.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiNotFoundResponse({ description: 'NOT_FOUND: la cita no existe.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiConflictResponse({ description: 'CONFLICT: transición de estado no permitida (por ejemplo, de cancelled a completed).', schema: ERROR_RESPONSE_SCHEMA })
  async updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEstadoDto,
  ) {
    return this.appointmentsService.updateStatus(user, id, dto.status);
  }
}
