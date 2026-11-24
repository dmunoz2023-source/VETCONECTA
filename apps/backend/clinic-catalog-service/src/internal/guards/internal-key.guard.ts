import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { AppConfig } from '../../config/configuration';

/** [G3] Protege las rutas /internal: sin X-Internal-Key válida responde 401 (Diseño §3.2). */
@Injectable()
export class InternalKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const received = context.switchToHttp().getRequest().headers['x-internal-key'];
    const expected = this.config.get('internalKey', { infer: true });

    if (typeof received !== 'string' || !this.matches(received, expected)) {
      throw new UnauthorizedException('Clave interna inválida.');
    }
    return true;
  }

  private matches(received: string, expected: string): boolean {
    const a = Buffer.from(received);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
