import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../types/jwt-payload.interface';

// Materializa BR-14: compara el rol del usuario (inyectado por JwtHeadersGuard en
// request.user, a partir de la cabecera X-User-Role) contra los roles autorizados
// que declara @Roles(...) en la ruta. Sin @Roles(), la ruta queda abierta a
// cualquier usuario autenticado (solo exige que JwtHeadersGuard haya pasado antes).
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<JwtPayload['role'][]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Tu rol no tiene permiso para esta accion (BR-14).');
    }

    return true;
  }
}
