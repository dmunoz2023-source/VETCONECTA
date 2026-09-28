import { isAxiosError } from 'axios';

export interface ApiErrorInfo {
  status: number | null;
  message: string;
}

export function parseApiError(error: unknown): ApiErrorInfo {
  if (isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const message =
      error.response?.data?.message ??
      (status === 403
        ? 'No tienes permisos para realizar esta acción.'
        : 'No se pudo conectar con el servidor.');
    return { status, message: Array.isArray(message) ? message.join(', ') : message };
  }
  return { status: null, message: 'Ocurrió un error inesperado.' };
}