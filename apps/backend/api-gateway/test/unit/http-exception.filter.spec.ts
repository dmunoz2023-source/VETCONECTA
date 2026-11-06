import {
  ArgumentsHost,
  BadRequestException,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HttpExceptionFilter } from '../../../../../libs/shared/src/filters/http-exception.filter';
import {
  AccessDeniedException,
  BusinessRuleException,
  ResourceNotFoundException,
  SlotAlreadyTakenException,
} from '../../../../../libs/shared/src/exceptions/domain.exceptions';

function createHost(headers: Record<string, string> = { 'x-request-id': 'req-123' }) {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const request = {
    method: 'POST',
    url: '/v1/scheduling/appointments',
    originalUrl: '/v1/scheduling/appointments',
    headers,
  };
  const host = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

function queryFailedError(code: string, message: string) {
  return Object.assign(new Error(message), {
    name: 'QueryFailedError',
    query: 'INSERT INTO clients_pets.clients (rut, email) VALUES ($1, $2)',
    parameters: ['12.345.678-9', 'dueno@vetconecta.cl'],
    driverError: { code },
  });
}

describe('HttpExceptionFilter [J3]', () => {
  let filter: HttpExceptionFilter;
  let warn: jest.SpyInstance;
  let error: jest.SpyInstance;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    error = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('entrega el formato único del Diseño §3.3', () => {
    const { host, status, json } = createHost();

    filter.catch(new SlotAlreadyTakenException(), host);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({
      statusCode: 409,
      error: 'SLOT_ALREADY_TAKEN',
      message: 'La hora seleccionada ya fue reservada.',
      path: '/v1/scheduling/appointments',
      requestId: 'req-123',
      timestamp: expect.any(String),
    });
  });

  it.each([
    [new ResourceNotFoundException(), 404, 'RESOURCE_NOT_FOUND'],
    [new AccessDeniedException(), 403, 'ACCESS_DENIED'],
    [new BusinessRuleException('La cita aún no está realizada.', 'APPOINTMENT_NOT_COMPLETED'), 422, 'APPOINTMENT_NOT_COMPLETED'],
  ])('traduce excepciones de dominio a su código HTTP (%#)', (exception, statusCode, code) => {
    const { host, status, json } = createHost();

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(statusCode);
    expect(json.mock.calls[0][0]).toMatchObject({ statusCode, error: code });
  });

  it('reemplaza el texto de las excepciones de Nest por un código estable', () => {
    const { host, json } = createHost();

    filter.catch(new NotFoundException('Mascota no encontrada.'), host);
    filter.catch(new ForbiddenException('Tu rol no tiene permiso para esta accion (BR-14).'), host);

    expect(json.mock.calls[0][0]).toMatchObject({ statusCode: 404, error: 'NOT_FOUND', message: 'Mascota no encontrada.' });
    expect(json.mock.calls[1][0]).toMatchObject({ statusCode: 403, error: 'FORBIDDEN' });
  });

  it('agrupa los errores del ValidationPipe en details con código VALIDATION_ERROR', () => {
    const { host, status, json } = createHost();
    const validation = new BadRequestException({
      statusCode: 400,
      message: ['limit must not be greater than 50', 'page must be an integer number'],
      error: 'Bad Request',
    });

    filter.catch(validation, host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json.mock.calls[0][0]).toMatchObject({
      statusCode: 400,
      error: 'VALIDATION_ERROR',
      details: ['limit must not be greater than 50', 'page must be an integer number'],
    });
  });

  it.each([
    ['23505', 409, 'DUPLICATE_RESOURCE'],
    ['23503', 422, 'RELATED_RESOURCE_CONSTRAINT'],
    ['22P02', 400, 'INVALID_INPUT'],
  ])('traduce el error %s de PostgreSQL sin exponer el SQL', (pgCode, statusCode, code) => {
    const { host, status, json } = createHost();

    filter.catch(queryFailedError(pgCode, 'duplicate key value violates unique constraint "clients_rut_key"'), host);

    expect(status).toHaveBeenCalledWith(statusCode);
    const body = JSON.stringify(json.mock.calls[0][0]);
    expect(json.mock.calls[0][0]).toMatchObject({ statusCode, error: code });
    expect(body).not.toMatch(/INSERT|constraint|12\.345\.678-9|dueno@vetconecta/);
  });

  it('responde 500 genérico ante un error inesperado sin filtrar su mensaje', () => {
    const { host, status, json } = createHost();

    filter.catch(new Error('password=supersecreta en la conexión'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json.mock.calls[0][0]).toMatchObject({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Ocurrió un error inesperado. Intenta nuevamente.',
    });
    expect(error).toHaveBeenCalled();
  });

  it('usa "unknown" como requestId si la petición no viene del Gateway', () => {
    const { host, json } = createHost({});

    filter.catch(new NotFoundException(), host);

    expect(json.mock.calls[0][0].requestId).toBe('unknown');
  });

  it('registra método, ruta, código y requestId, sin datos personales', () => {
    const { host } = createHost();

    filter.catch(queryFailedError('23505', 'duplicate key'), host);

    expect(warn).toHaveBeenCalledWith(
      'POST /v1/scheduling/appointments -> 409 DUPLICATE_RESOURCE requestId=req-123 pg=23505',
    );
    expect(JSON.stringify(warn.mock.calls)).not.toMatch(/12\.345\.678-9|dueno@vetconecta|INSERT/);
  });
});
