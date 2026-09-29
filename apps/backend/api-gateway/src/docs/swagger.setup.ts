import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, getSchemaPath } from '@nestjs/swagger';
import { LoginRequestDto, LoginResponseDto, RegisterRequestDto } from './dto/auth.dto';
import { CitaDto, PaginatedCitasDto, PaginationMetaDto } from './dto/cita.dto';
import { ClinicDto } from './dto/catalog.dto';

const DOCS_PATH = 'docs';

/**
 * Documentacion OpenAPI consolidada del Gateway, servida en /docs.
 *
 * El Gateway no expone controladores propios (el ruteo vive en src/proxy/,
 * de otro desarrollador), asi que las rutas del contrato se declaran a mano
 * sobre el documento generado. Esto le da al equipo Mobile un OpenAPI completo
 * (paths + esquemas) para generar clientes HTTP tipados, sin crear rutas Express
 * reales en el Gateway.
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('VetConecta API Gateway')
    .setDescription(
      'Punto de entrada unico de VetConecta. Valida el JWT una sola vez e ' +
        'inyecta X-User-Id, X-User-Role y X-Client-Id hacia los microservicios.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .addTag('auth', 'Autenticacion y cuentas (:3001)')
    .addTag('citas', 'Agenda de citas (:3004)')
    .addTag('catalog', 'Catalogo institucional (:3006)')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      LoginRequestDto,
      LoginResponseDto,
      RegisterRequestDto,
      CitaDto,
      PaginatedCitasDto,
      PaginationMetaDto,
      ClinicDto,
    ],
  });

  document.paths = { ...document.paths, ...contractPaths() };

  SwaggerModule.setup(DOCS_PATH, app, document);
}

function jsonBody(schema: object) {
  return { content: { 'application/json': { schema } } };
}

// Rutas del contrato publico del Gateway (documentacion, no ejecucion).
function contractPaths(): Record<string, any> {
  return {
    '/v1/auth/login': {
      post: {
        tags: ['auth'],
        summary: 'Inicia sesion y devuelve un JWT',
        requestBody: jsonBody({ $ref: getSchemaPath(LoginRequestDto) }),
        responses: {
          200: { description: 'Credenciales validas', ...jsonBody({ $ref: getSchemaPath(LoginResponseDto) }) },
          401: { description: 'Credenciales invalidas' },
        },
      },
    },
    '/v1/auth/register': {
      post: {
        tags: ['auth'],
        summary: 'Registra un usuario nuevo',
        requestBody: jsonBody({ $ref: getSchemaPath(RegisterRequestDto) }),
        responses: { 201: { description: 'Usuario creado' } },
      },
    },
    '/v1/citas': {
      get: {
        tags: ['citas'],
        summary: 'Lista las citas del dueno autenticado (C3)',
        security: [{ bearer: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            required: false,
            description: 'Filtro por estado separado por comas (ej. booked,confirmed)',
            schema: { type: 'string' },
          },
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'Citas del dueno', ...jsonBody({ $ref: getSchemaPath(PaginatedCitasDto) }) },
          401: { description: 'Falta o es invalido el JWT' },
          403: { description: 'Rol no autorizado o sin client_id (BR-8)' },
        },
      },
    },
    '/v1/catalog/clinic': {
      get: {
        tags: ['catalog'],
        summary: 'Datos institucionales de la clinica (publico)',
        responses: {
          200: { description: 'Datos de la clinica', ...jsonBody({ $ref: getSchemaPath(ClinicDto) }) },
        },
      },
    },
  };
}
