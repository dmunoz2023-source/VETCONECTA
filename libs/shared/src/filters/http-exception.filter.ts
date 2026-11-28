import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ErrorResponse } from '../types/error-response.interface';

// Tipos mínimos de Express para no acoplar libs/shared a @types/express.
interface HttpRequest {
  method: string;
  url: string;
  originalUrl?: string;
  headers: Record<string, string | string[] | undefined>;
}

interface HttpResponse {
  status(code: number): { json(body: unknown): void };
}

interface ResolvedError {
  statusCode: number;
  error: string;
  message: string;
  details?: string[];
  // Dato técnico para el log (nunca se envía al cliente).
  logDetail?: string;
}

// Errores de PostgreSQL que se traducen sin exponer el SQL ni los valores.
const DB_ERRORS: Record<string, Omit<ResolvedError, 'logDetail'>> = {
  // unique_violation
  '23505': {
    statusCode: HttpStatus.CONFLICT,
    error: 'DUPLICATE_RESOURCE',
    message: 'El recurso ya existe.',
  },
  // foreign_key_violation
  '23503': {
    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    error: 'RELATED_RESOURCE_CONSTRAINT',
    message: 'La operación hace referencia a un recurso inexistente o que está en uso.',
  },
  // check_violation (respaldo de la BD cuando una regla no se validó antes)
  '23514': {
    statusCode: HttpStatus.BAD_REQUEST,
    error: 'CONSTRAINT_VIOLATION',
    message: 'Uno de los valores enviados no cumple las reglas del recurso.',
  },
  // invalid_text_representation (ej. un UUID mal formado)
  '22P02': {
    statusCode: HttpStatus.BAD_REQUEST,
    error: 'INVALID_INPUT',
    message: 'Uno de los valores enviados tiene un formato inválido.',
  },
};

const STABLE_CODE = /^[A-Z][A-Z0-9_]*$/;

/**
 * [J3] Filtro global de excepciones (Diseño de Microservicios §3.3).
 * Toda respuesta de error sale con el mismo cuerpo:
 * { statusCode, error, message, details?, path, requestId, timestamp }.
 * Se registra en el main.ts de cada servicio con app.useGlobalFilters().
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<HttpRequest>();
    const response = ctx.getResponse<HttpResponse>();

    const resolved = this.resolve(exception);
    const path = request.originalUrl ?? request.url;
    const requestId = this.requestIdOf(request);

    const body: ErrorResponse = {
      statusCode: resolved.statusCode,
      error: resolved.error,
      message: resolved.message,
      ...(resolved.details ? { details: resolved.details } : {}),
      path,
      requestId,
      timestamp: new Date().toISOString(),
    };

    this.log(request.method, path, requestId, resolved, exception);
    response.status(resolved.statusCode).json(body);
  }

  private resolve(exception: unknown): ResolvedError {
    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    const dbCode = this.databaseErrorCode(exception);
    if (dbCode) {
      const known = DB_ERRORS[dbCode];
      return known
        ? { ...known, logDetail: `pg=${dbCode}` }
        : { ...this.internalError(), logDetail: `pg=${dbCode}` };
    }

    return this.internalError();
  }

  private fromHttpException(exception: HttpException): ResolvedError {
    const statusCode = exception.getStatus();
    const payload = exception.getResponse();
    const fields = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {};

    // ValidationPipe entrega `message` como arreglo con cada regla que falló.
    if (Array.isArray(fields.message)) {
      return {
        statusCode,
        error: 'VALIDATION_ERROR',
        message: 'Los datos enviados no son válidos.',
        details: fields.message.map(String),
      };
    }

    const message =
      typeof payload === 'string'
        ? payload
        : typeof fields.message === 'string'
          ? fields.message
          : exception.message;

    // Las excepciones de dominio traen un código estable; las de Nest traen
    // un texto como "Not Found", que se reemplaza por el nombre del estado.
    const error =
      typeof fields.error === 'string' && STABLE_CODE.test(fields.error)
        ? fields.error
        : this.defaultCode(statusCode);

    return { statusCode, error, message };
  }

  private internalError(): ResolvedError {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Ocurrió un error inesperado. Intenta nuevamente.',
    };
  }

  // QueryFailedError de TypeORM (se detecta por forma, sin importar typeorm,
  // porque el Gateway no tiene base de datos).
  private databaseErrorCode(exception: unknown): string | undefined {
    if (typeof exception !== 'object' || exception === null) return undefined;
    const err = exception as { name?: string; code?: unknown; driverError?: { code?: unknown } };
    if (err.name !== 'QueryFailedError') return undefined;
    const code = err.driverError?.code ?? err.code;
    return typeof code === 'string' ? code : undefined;
  }

  private defaultCode(statusCode: number): string {
    return HttpStatus[statusCode] ?? 'ERROR';
  }

  private requestIdOf(request: HttpRequest): string {
    const header = request.headers['x-request-id'];
    const value = Array.isArray(header) ? header[0] : header;
    return value || 'unknown';
  }

  // Solo se registra método, ruta, estado, código y requestId: nunca el body,
  // las cabeceras ni los parámetros SQL, que pueden traer datos personales (RUT, correo, token).
  private log(
    method: string,
    path: string,
    requestId: string,
    resolved: ResolvedError,
    exception: unknown,
  ): void {
    const line =
      `${method} ${path} -> ${resolved.statusCode} ${resolved.error} requestId=${requestId}` +
      (resolved.logDetail ? ` ${resolved.logDetail}` : '');

    if (resolved.statusCode >= 500) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(line, resolved.logDetail ? undefined : stack);
    } else {
      this.logger.warn(line);
    }
  }
}
