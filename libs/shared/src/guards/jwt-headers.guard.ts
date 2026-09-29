import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../types/jwt-payload.interface';

// Lee las cabeceras que manda el Gateway (X-User-Id, X-User-Role, X-Client-Id) y
// arma request.user, para que @CurrentUser() y las otras guardas lo puedan usar.
// Acá no se revisa la firma del JWT, eso ya lo hizo el Gateway (NFR-3).
@Injectable()
export class JwtHeadersGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];
    const role = request.headers['x-user-role'];

    if (!userId || !role) {
      throw new UnauthorizedException('Faltan las cabeceras de autenticacion del Gateway.');
    }

    const user: JwtPayload = {
      sub: userId,
      email: request.headers['x-user-email'] ?? '',
      role: role as JwtPayload['role'],
      clientId: request.headers['x-client-id'] || undefined,
    };

    request.user = user;
    return true;
  }
}
