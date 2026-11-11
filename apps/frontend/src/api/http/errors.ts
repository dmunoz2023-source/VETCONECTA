import axios from 'axios';

/** Formato de error común del backend (filtro global de excepciones). */
export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
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

/**
 * Mensaje legible del formato de error común (`message`), o `fallback` si no viene.
 * Los 400 de class-validator traen `message` como lista: se unen en un solo texto.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  const message = getErrorBody(error)?.message;
  if (typeof message === 'string' && message.trim()) return message;
  if (Array.isArray(message)) {
    const parts = message.filter((part): part is string => typeof part === 'string' && part.trim() !== '');
    if (parts.length) return parts.join(' ');
  }
  return fallback;
}
