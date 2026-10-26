import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';

/**
 * Protege las rutas /internal: solo otros servicios que conozcan el secreto
 * compartido (cabecera X-Internal-Key) pueden llamarlas.
 */
@Injectable()
export class InternalKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const received = request.headers['x-internal-key'];
    const expected = this.configService.get<string>('internalKey') ?? '';

    if (typeof received !== 'string' || !this.matches(received, expected)) {
      throw new UnauthorizedException('Clave interna inválida');
    }
    return true;
  }

  private matches(received: string, expected: string): boolean {
    const a = Buffer.from(received);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  }
}