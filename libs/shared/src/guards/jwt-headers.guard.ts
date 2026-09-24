import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../types/jwt-payload.interface';

// Lee las cabeceras que el API Gateway ya valido e inyecto (X-User-Id, X-User-Role,
// X-Client-Id) y las deja en request.user con la forma de JwtPayload, para que
// @CurrentUser() y RolesGuard/OwnershipGuard las puedan usar. No vuelve a verificar
// la firma del JWT: eso lo hizo el Gateway una unica vez (NFR-3).
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
