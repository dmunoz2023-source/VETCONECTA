import { isAxiosError } from 'axios';
import type { ApiError, ApiErrorBody } from '../types/api.types';

/**
 * Error que lanza toda la capa de API del frontend.
 * Es un Error real (tiene stack y funciona con instanceof) y además
 * cumple la forma normalizada ApiError.
 */
export class ApiRequestError extends Error implements ApiError {
  readonly status: number;
  readonly code: string;
  readonly details: string[];
  readonly requestId?: string;

  constructor(data: ApiError) {
    super(data.message);
    this.name = 'ApiRequestError';
    this.status = data.status;
    this.code = data.code;
    this.details = data.details;
    this.requestId = data.requestId;
  }
}

/** Mensajes por defecto, en español, según el código HTTP. */
const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'Los datos enviados no son válidos. Revisa el formulario.',
  401: 'Tu sesión expiró o no has iniciado sesión. Vuelve a ingresar.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'El recurso solicitado no existe.',
  409: 'El registro ya existe.',
  422: 'La operación no cumple las reglas de negocio.',
};

const SERVER_ERROR_MESSAGE =
  'Ocurrió un error en el servidor. Intenta nuevamente en unos minutos.';
const NETWORK_ERROR_MESSAGE =
  'No se pudo conectar con el servidor. Verifica tu conexión o que el API Gateway esté activo.';
const UNKNOWN_ERROR_MESSAGE = 'Ocurrió un error inesperado.';

/** Comprueba que el cuerpo tenga el formato común de error del backend. */
function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'statusCode' in value &&
    'message' in value
  );
}

function defaultMessageFor(status: number): string {
  if (status >= 500) return SERVER_ERROR_MESSAGE;
  return DEFAULT_MESSAGES[status] ?? UNKNOWN_ERROR_MESSAGE;
}

/**
 * Convierte cualquier error (Axios, red, código) en un ApiRequestError.
 * Si ya viene normalizado, lo devuelve tal cual.
 */
export function toApiError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) return error;

  if (!isAxiosError(error)) {
    return new ApiRequestError({
      status: 0,
      code: 'UNKNOWN_ERROR',
      message: UNKNOWN_ERROR_MESSAGE,
      details: [],
    });
  }

  // Sin respuesta: servidor caído, CORS, timeout o sin internet.
  if (!error.response) {
    return new ApiRequestError({
      status: 0,
      code: error.code === 'ECONNABORTED' ? 'TIMEOUT' : 'NETWORK_ERROR',
      message: NETWORK_ERROR_MESSAGE,
      details: [],
    });
  }

  const { status, data } = error.response;

  if (!isApiErrorBody(data)) {
    return new ApiRequestError({
      status,
      code: `HTTP_${status}`,
      message: defaultMessageFor(status),
      details: [],
    });
  }

  // 400 de validación: NestJS devuelve un arreglo con cada problema.
  const details = Array.isArray(data.message) ? data.message : [];
  const backendMessage = Array.isArray(data.message) ? '' : data.message;

  // En 401 y 5xx preferimos un mensaje propio: el del backend suele ser técnico.
  const useBackendMessage = status !== 401 && status < 500 && backendMessage !== '';

  return new ApiRequestError({
    status,
    code: data.error || `HTTP_${status}`,
    message: useBackendMessage ? backendMessage : defaultMessageFor(status),
    details,
    requestId: data.requestId,
  });
}