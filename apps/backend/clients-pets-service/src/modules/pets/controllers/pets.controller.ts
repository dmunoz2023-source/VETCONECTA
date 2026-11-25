import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { ClientsRepository } from '../../clients/repositories/clients.repository';
import { CreatePetDto } from '../dto/create-pet.dto';
import { UpdatePetDto } from '../dto/update-pet.dto';
import { PetsService } from '../services/pets.service';

@ApiTags('pets')
@ApiBearerAuth()
@Controller('v1/pets')
@UseGuards(JwtHeadersGuard, RolesGuard)
export class PetsController {
  constructor(
    private readonly petsService: PetsService,
    private readonly clientsRepository: ClientsRepository,
  ) {}

  /**
   * GET /v1/pets/:id (FR-2, BR-2, BR-8)
   * Ficha de la mascota con la edad calculada al vuelo.
   */
  @Get(':id')
  @Roles('owner', 'vet', 'reception', 'admin')
  @ApiOperation({ summary: 'Ficha de una mascota', description: 'Con la edad calculada al vuelo (BR-2). El dueño solo accede a las suyas (BR-8): una mascota ajena responde 404 para no revelar su existencia.' })
  @ApiParam({ name: 'id', description: 'UUID de la mascota.' })
  @ApiOkResponse({ description: 'Ficha de la mascota con su edad.' })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o expiró.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiForbiddenResponse({ description: 'FORBIDDEN: el rol no tiene permiso.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiNotFoundResponse({ description: 'NOT_FOUND: la mascota no existe o no pertenece al dueño (BR-8).', schema: ERROR_RESPONSE_SCHEMA })
  async getPet(
    @Param('id') petId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role === 'owner') {
      const clientId =
        user.clientId ?? (await this.clientsRepository.findByUserId(user.sub))?.id;

      if (!clientId) {
        throw new UnauthorizedException(
          'El usuario autenticado no tiene un ID de cliente asociado.',
        );
      }
      return this.petsService.findByPetId(clientId, petId);
    }

    return this.petsService.findById(petId);
  }

  /**
   * POST /v1/pets (FR-5, BR-1)
   * Crea una mascota asociada a un cliente.
   */
  @Post()
  @Roles('admin', 'reception')
  @ApiOperation({ summary: 'Crear una mascota', description: 'Roles: admin, reception. Siempre asociada a un cliente existente (FR-5, BR-1).' })
  @ApiCreatedResponse({ description: 'Mascota creada.' })
  @ApiBadRequestResponse({ description: 'VALIDATION_ERROR: cuerpo o parámetros inválidos.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o expiró.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiForbiddenResponse({ description: 'FORBIDDEN: el rol no puede crear mascotas.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiNotFoundResponse({ description: 'NOT_FOUND: el cliente indicado no existe.', schema: ERROR_RESPONSE_SCHEMA })
  async create(@Body() createPetDto: CreatePetDto) {
    return this.petsService.create(createPetDto);
  }

  /**
   * PATCH /v1/pets/:id (FR-5)
   * Actualización parcial de la ficha de la mascota.
   */
  @Patch(':id')
  @Roles('admin', 'vet', 'reception')
  @ApiOperation({ summary: 'Actualizar una mascota', description: 'Roles: admin, vet, reception. Actualización parcial (FR-5).' })
  @ApiParam({ name: 'id', description: 'UUID de la mascota.' })
  @ApiOkResponse({ description: 'Mascota actualizada.' })
  @ApiBadRequestResponse({ description: 'VALIDATION_ERROR: cuerpo o parámetros inválidos.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o expiró.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiForbiddenResponse({ description: 'FORBIDDEN: el rol no puede editar mascotas.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiNotFoundResponse({ description: 'NOT_FOUND: la mascota no existe.', schema: ERROR_RESPONSE_SCHEMA })
  async update(
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
  ) {
    return this.petsService.update(id, updatePetDto);
  }

  /**
   * DELETE /v1/pets/:id (BR-9)
   * Baja lógica (active = false).
   */
  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Dar de baja una mascota', description: 'Solo admin. Baja lógica (active = false): nunca se borra, para conservar el historial clínico (BR-9).' })
  @ApiParam({ name: 'id', description: 'UUID de la mascota.' })
  @ApiOkResponse({ description: 'Mascota dada de baja.' })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o expiró.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiForbiddenResponse({ description: 'FORBIDDEN: el rol no es admin.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiNotFoundResponse({ description: 'NOT_FOUND: la mascota no existe.', schema: ERROR_RESPONSE_SCHEMA })
  async remove(@Param('id') id: string) {
    return this.petsService.softDelete(id);
  }
}