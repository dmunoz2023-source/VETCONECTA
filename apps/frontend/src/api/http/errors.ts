import axios from 'axios';

/** Formato de error común del backend (Diseño de microservicios §3.3, filtro global de excepciones). */
export interface ApiErrorResponse {
  statusCode: number;
  /** Código estable para la lógica del cliente (p. ej. SLOT_ALREADY_TAKEN). */
  error: string;
  /** Texto legible; los 400 de validación lo envían como lista. */
  message: string | string[];
  /** Detalle por campo de los errores de validación (opcional). */
  details?: string[];
  /** Ruta que originó el error. */
  path: string;
  /** Traza X-Request-Id para correlacionar con los logs del backend. */
  requestId: string;
  /** Momento del error en ISO 8601. */
  timestamp: string;
}

/** Código HTTP de la respuesta de error, o null si no hubo respuesta (sin red, CORS, timeout). */
export function getErrorStatus(error: unknown): number | null {
  if (!axios.isAxiosError(error) || !error.response) return null;
  return error.response.status;
}

/** Cuerpo de la respuesta de error, si el backend lo envió. */
export function getErrorBody(error: unknown): Partial<ApiErrorResponse> | null {
  if (!axios.isAxiosError(error)) return null;
  return (error.response?.data as Partial<ApiErrorResponse> | undefined) ?? null;
}

function nonEmptyStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((part): part is string => typeof part === 'string' && part.trim() !== '');
}

/**
 * Mensaje legible del formato de error común (`message`), o `fallback` si no viene.
 * Si trae `details` (campos que fallaron, VALIDATION_ERROR) se agregan al mensaje.
 * Los 400 de class-validator traen `message` como lista: se unen en un solo texto.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  const body = getErrorBody(error);
  const message = body?.message;
  if (typeof message === 'string' && message.trim()) {
    const details = nonEmptyStrings(body?.details);
    return details.length ? `${message} ${details.join('. ')}` : message;
  }
  const parts = nonEmptyStrings(message);
  return parts.length ? parts.join(' ') : fallback;
}
