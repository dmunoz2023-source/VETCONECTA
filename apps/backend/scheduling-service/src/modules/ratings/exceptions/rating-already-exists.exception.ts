import { HttpStatus } from '@nestjs/common';
import { DomainException } from '@app/shared/exceptions/domain.exceptions';

/** [K2] 409: la cita ya tiene una calificación (una por cita, BR-13). */
export class RatingAlreadyExistsException extends DomainException {
  constructor(message = 'Esta cita ya fue calificada.') {
    super('RATING_ALREADY_EXISTS', message, HttpStatus.CONFLICT);
  }
}
