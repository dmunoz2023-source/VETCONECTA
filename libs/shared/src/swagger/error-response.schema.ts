// [J3] Esquema OpenAPI del cuerpo de error (Diseño §3.3), para documentar en Swagger
// las respuestas de error de cada endpoint:
//   @ApiForbiddenResponse({ description: '...', schema: ERROR_RESPONSE_SCHEMA })
// Es un objeto plano (sin importar @nestjs/swagger) porque libs/shared no tiene
// dependencias propias y no todos los servicios instalan Swagger.
export const ERROR_RESPONSE_SCHEMA = {
  type: 'object',
  required: ['statusCode', 'error', 'message', 'path', 'requestId', 'timestamp'],
  properties: {
    statusCode: { type: 'integer', example: 409 },
    error: {
      type: 'string',
      example: 'SLOT_ALREADY_TAKEN',
      description:
        'Código estable para la lógica del cliente. Comunes: VALIDATION_ERROR (400), ' +
        'UNAUTHORIZED (401), FORBIDDEN / ACCESS_DENIED (403), NOT_FOUND / RESOURCE_NOT_FOUND (404), ' +
        'CONFLICT / SLOT_ALREADY_TAKEN / DUPLICATE_RESOURCE (409), ' +
        'BUSINESS_RULE_VIOLATION / RELATED_RESOURCE_CONSTRAINT (422), INTERNAL_SERVER_ERROR (500).',
    },
    message: { type: 'string', example: 'La hora seleccionada ya fue reservada.' },
    details: {
      type: 'array',
      items: { type: 'string' },
      example: ['limit must not be greater than 50'],
      description: 'Solo en VALIDATION_ERROR: cada regla del DTO que falló.',
    },
    path: { type: 'string', example: '/v1/scheduling/appointments' },
    requestId: { type: 'string', example: 'a41f9c2e-7b3d-4e8a-9f10-2c6d5b8e1a77' },
    timestamp: { type: 'string', format: 'date-time', example: '2026-08-28T14:21:03.512Z' },
  },
};
