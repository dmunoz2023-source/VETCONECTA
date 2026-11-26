import { timingSafeEqual } from 'crypto';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class InternalKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const provided = request.headers['x-internal-key'];
    // INTERNAL_KEY ya fue validada por Joi al arrancar el servicio.
    const expected = process.env.INTERNAL_KEY ?? '';

    const a = Buffer.from(typeof provided === 'string' ? provided : '');
    const b = Buffer.from(expected);
    if (!expected || a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException(
        'Acceso denegado: cabecera interna inválida o no proporcionada.',
      );
    }
    return true;
  }
}