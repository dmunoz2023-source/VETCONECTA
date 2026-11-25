import {
  Body,
  Controller,
  Get,
  Param,
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
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ERROR_RESPONSE_SCHEMA } from '@app/shared/swagger/error-response.schema';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { UpdateClientProfileDto } from '../dto/update-client-profile.dto';
import { ClientsService } from '../services/clients.service';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('v1/clients')
@UseGuards(JwtHeadersGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * GET /v1/clients?q=&page=&limit= (FR-5)
   * Busca clientes activos por RUT, nombre completo o teléfono.
   * Accesible para reception, admin y vet.
   */
  @Get()
  @Roles('reception', 'admin', 'vet')
  @ApiOperation({ summary: 'Buscar clientes', description: 'Roles: reception, admin, vet. Busca por RUT, nombre o teléfono, con paginación (FR-5).' })
  @ApiQuery({ name: 'q', required: false, example: '12.345.678-9', description: 'RUT, nombre completo o teléfono.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOkResponse({ description: 'Página de clientes: { data: [...], meta: { total, page, limit } }.' })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o expiró.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiForbiddenResponse({ description: 'FORBIDDEN: el rol no puede buscar clientes (BR-14).', schema: ERROR_RESPONSE_SCHEMA })
  async getClients(
    @Query('q') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.clientsService.findAll(search, Number(page), Number(limit));
  }

  @Post()
  @Roles('reception', 'admin')
  @ApiOperation({ summary: 'Crear un cliente', description: 'Roles: reception, admin (FR-5, UC-05).' })
  @ApiCreatedResponse({ description: 'Cliente creado.' })
  @ApiBadRequestResponse({ description: 'VALIDATION_ERROR: cuerpo o parámetros inválidos.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o expiró.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiForbiddenResponse({ description: 'FORBIDDEN: el rol no puede crear clientes (BR-14).', schema: ERROR_RESPONSE_SCHEMA })
  @ApiConflictResponse({ description: 'CONFLICT: el RUT ya está registrado (UC-05 A1).', schema: ERROR_RESPONSE_SCHEMA })
  async createClient(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get('me')
  @Roles('owner')
  @ApiOperation({ summary: 'Mi perfil', description: 'Solo owner. Perfil del dueño autenticado (FR-14).' })
  @ApiOkResponse({ description: 'Perfil del dueño.' })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o expiró.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiForbiddenResponse({ description: 'FORBIDDEN: el rol no es owner.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiNotFoundResponse({ description: 'NOT_FOUND: el usuario no tiene ficha de cliente.', schema: ERROR_RESPONSE_SCHEMA })
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.clientsService.getMyProfile(user);
  }

  @Patch('me')
  @Roles('owner')
  @ApiOperation({ summary: 'Editar mis datos de contacto', description: 'Solo owner. Permite cambiar correo, teléfono, dirección y comuna. Enviar rut, nombres o apellidos se rechaza con 403 (FR-14, BR-15).' })
  @ApiOkResponse({ description: 'Perfil actualizado.' })
  @ApiBadRequestResponse({ description: 'VALIDATION_ERROR: cuerpo o parámetros inválidos.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o expiró.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiForbiddenResponse({ description: 'FORBIDDEN: el rol no es owner, o se intentó modificar el RUT o el nombre (BR-15).', schema: ERROR_RESPONSE_SCHEMA })
  async updateMyProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateProfileDto: UpdateClientProfileDto,
  ) {
    return this.clientsService.updateMyProfile(user, updateProfileDto);
  }

  @Get('me/pets')
  @Roles('owner')
  @ApiOperation({ summary: 'Mis mascotas', description: 'Solo owner. Mascotas del dueño autenticado, con edad calculada; alimenta el selector multi-mascota (FR-11, BR-8, BR-12).' })
  @ApiOkResponse({ description: 'Mascotas del dueño autenticado.' })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o expiró.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiForbiddenResponse({ description: 'FORBIDDEN: el rol no es owner.', schema: ERROR_RESPONSE_SCHEMA })
  async getMyPets(@CurrentUser() user: JwtPayload) {
    return this.clientsService.getMyPets(user);
  }

  @Get(':id')
  @Roles('reception', 'admin', 'vet')
  @ApiOperation({ summary: 'Ficha de un cliente', description: 'Roles: reception, admin, vet. Incluye el listado de sus mascotas (FR-5).' })
  @ApiParam({ name: 'id', description: 'UUID del cliente.' })
  @ApiOkResponse({ description: 'Ficha del cliente.' })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o expiró.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiForbiddenResponse({ description: 'FORBIDDEN: el rol no puede consultar clientes.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiNotFoundResponse({ description: 'NOT_FOUND: el cliente no existe.', schema: ERROR_RESPONSE_SCHEMA })
  async getClient(@Param('id') clientId: string) {
    return this.clientsService.findById(clientId);
  }

  @Patch(':id')
  @Roles('reception', 'admin')
  @ApiOperation({ summary: 'Actualizar un cliente', description: 'Roles: reception, admin. Actualización parcial desde el panel (FR-5).' })
  @ApiParam({ name: 'id', description: 'UUID del cliente.' })
  @ApiOkResponse({ description: 'Cliente actualizado.' })
  @ApiBadRequestResponse({ description: 'VALIDATION_ERROR: cuerpo o parámetros inválidos.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o expiró.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiForbiddenResponse({ description: 'FORBIDDEN: el rol no puede editar clientes.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiNotFoundResponse({ description: 'NOT_FOUND: el cliente no existe.', schema: ERROR_RESPONSE_SCHEMA })
  async updateClient(
    @Param('id') clientId: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(clientId, updateClientDto);
  }
}