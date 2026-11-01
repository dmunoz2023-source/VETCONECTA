// Cuerpo de error único de todos los servicios (Diseño de Microservicios §3.3).
// Que sea idéntico en todos lados es lo que permite a Mobile y al panel web
// escribir un solo manejador de errores.
export interface ErrorResponse {
  statusCode: number;
  // Código estable en MAYÚSCULAS (ej. SLOT_ALREADY_TAKEN), apto para lógica del cliente.
  error: string;
  // Mensaje legible para mostrar al usuario.
  message: string;
  // Solo en errores de validación (400): lista de campos/reglas que fallaron.
  details?: string[];
  path: string;
  // X-Request-Id que genera el Gateway; permite seguir la petición en los logs.
  requestId: string;
  timestamp: string;
}
