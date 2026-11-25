import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
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
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ERROR_RESPONSE_SCHEMA } from '@app/shared/swagger/error-response.schema';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { CreateRatingDto } from '../dto/create-rating.dto';
import { GetRatingsQueryDto, RatingsFilterDto } from '../dto/get-ratings-query.dto';
import { RatingsService } from '../services/ratings.service';

const RATING_EXAMPLE = {
  id: '0b5f2c1e-8a41-4a8e-9a3b-6d1f0c2e7a10',
  appointmentId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  stars: 5,
  comment: 'Muy buena atención.',
  createdAt: '2026-11-25T15:30:00.000Z',
};

/**
 * [K2] Calificaciones de las citas (FR-12, BR-13). El dueño califica una cita realizada;
 * el personal clínico consulta las calificaciones y el administrador, el resumen.
 */
@ApiTags('ratings')
@ApiBearerAuth()
@Controller('v1/scheduling')
@UseGuards(JwtHeadersGuard, RolesGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post('appointments/:id/rating')
  @Roles('owner')
  @ApiOperation({
    summary: 'Calificar una cita realizada',
    description:
      'Solo owner. La cita debe ser del dueño autenticado y estar realizada (completed). ' +
      'Cada cita admite una sola calificación (BR-13).',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Id de la cita.' })
  @ApiCreatedResponse({
    description: 'Calificación registrada.',
    schema: { example: RATING_EXAMPLE },
  })
  @ApiBadRequestResponse({ description: 'VALIDATION_ERROR: id inválido, stars fuera de 1 a 5 o comment de más de 500 caracteres.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o expiró.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiForbiddenResponse({ description: 'ACCESS_DENIED: el rol no es owner o la cita no es del dueño (BR-8).', schema: ERROR_RESPONSE_SCHEMA })
  @ApiNotFoundResponse({ description: 'RESOURCE_NOT_FOUND: la cita no existe.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiConflictResponse({ description: 'RATING_ALREADY_EXISTS: la cita ya fue calificada.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiUnprocessableEntityResponse({ description: 'APPOINTMENT_NOT_COMPLETED: la cita no está realizada.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiServiceUnavailableResponse({ description: 'clients-pets-service no responde y no se pudo verificar al dueño.', schema: ERROR_RESPONSE_SCHEMA })
  create(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateRatingDto,
  ) {
    return this.ratingsService.create(user, id, dto);
  }

  @Get('ratings')
  @Roles('vet', 'reception', 'admin')
  @ApiOperation({
    summary: 'Listar calificaciones',
    description:
      'Personal clínico (vet, reception, admin). De la más reciente a la más antigua, con filtros ' +
      'por veterinario y por fecha de la calificación, y paginación.',
  })
  @ApiOkResponse({
    description: 'Listado paginado de calificaciones.',
    schema: {
      example: {
        data: [
          {
            ...RATING_EXAMPLE,
            vetUserId: '55555555-5555-5555-5555-5555555555a1',
            appointmentStartTime: '2026-11-24T14:00:00.000Z',
          },
        ],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'VALIDATION_ERROR: filtros o paginación inválidos.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o expiró.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiForbiddenResponse({ description: 'ACCESS_DENIED: el rol no es personal clínico (BR-14).', schema: ERROR_RESPONSE_SCHEMA })
  findAll(@Query() query: GetRatingsQueryDto) {
    return this.ratingsService.findAll(query);
  }

  @Get('ratings/summary')
  @Roles('admin')
  @ApiOperation({
    summary: 'Resumen de calificaciones',
    description:
      'Solo admin (lo consume el panel de reportes, L2). Promedio y distribución de 1 a 5 estrellas, ' +
      'con los mismos filtros de veterinario y fecha. Sin calificaciones, average es null.',
  })
  @ApiOkResponse({
    description: 'Promedio y distribución.',
    schema: {
      example: {
        average: 4.33,
        total: 3,
        distribution: { '1': 0, '2': 0, '3': 1, '4': 0, '5': 2 },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'VALIDATION_ERROR: filtros inválidos.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o expiró.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiForbiddenResponse({ description: 'ACCESS_DENIED: el rol no es admin (BR-14).', schema: ERROR_RESPONSE_SCHEMA })
  summarize(@Query() query: RatingsFilterDto) {
    return this.ratingsService.summarize(query);
  }
}
