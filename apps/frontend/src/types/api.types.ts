/**
 * Metadatos de paginación que devuelve el Gateway en los listados.
 * Contrato: { data: [...], meta: { total, page, limit } }
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Cuerpo de error común que producen todos los microservicios
 * (HttpExceptionFilter de libs/shared).
 * `message` puede venir como arreglo cuando falla la validación del DTO (400).
 */
export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  path?: string;
  requestId?: string;
  timestamp?: string;
}

/**
 * Error normalizado que usa el frontend, venga de donde venga
 * (respuesta del backend, caída de red o error inesperado).
 */
export interface ApiError {
  /** Código HTTP; 0 si no hubo respuesta (red caída, CORS, timeout). */
  status: number;
  /** Código estable del backend (p. ej. "CONFLICT") o uno local ("NETWORK_ERROR"). */
  code: string;
  /** Mensaje legible, listo para mostrar en pantalla. */
  message: string;
  /** Mensajes de validación individuales cuando el backend devuelve varios. */
  details: string[];
  /** Traza X-Request-Id, útil para reportar el error a backend. */
  requestId?: string;
}