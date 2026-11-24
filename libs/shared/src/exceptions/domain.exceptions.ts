import { HttpException, HttpStatus } from '@nestjs/common';

// Excepción base de dominio: lleva un código estable (`error`) además del
// estado HTTP, para que HttpExceptionFilter lo publique tal cual (Diseño §3.3).
export class DomainException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    status: HttpStatus,
  ) {
    super({ error: code, message }, status);
  }
}

// 409: la hora ya fue tomada por otra reserva (BR-5).
export class SlotAlreadyTakenException extends DomainException {
  constructor(message = 'La hora seleccionada ya fue reservada.') {
    super('SLOT_ALREADY_TAKEN', message, HttpStatus.CONFLICT);
  }
}

// 404: el recurso no existe, o no se debe revelar que existe (BR-8).
export class ResourceNotFoundException extends DomainException {
  constructor(message = 'El recurso solicitado no existe.') {
    super('RESOURCE_NOT_FOUND', message, HttpStatus.NOT_FOUND);
  }
}

// 403: el usuario no tiene permiso sobre el recurso (BR-8, BR-12, BR-14, BR-15).
export class AccessDeniedException extends DomainException {
  constructor(message = 'No tienes permiso para realizar esta acción.') {
    super('ACCESS_DENIED', message, HttpStatus.FORBIDDEN);
  }
}

// 422: el cuerpo es válido pero viola una regla de negocio (ej. BR-13).
// `code` permite un código más específico, ej. 'APPOINTMENT_NOT_COMPLETED'.
export class BusinessRuleException extends DomainException {
  constructor(message: string, code = 'BUSINESS_RULE_VIOLATION') {
    super(code, message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
