import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtPayload } from '../types/jwt-payload.interface';

// Un dueño (owner) solo puede ver lo suyo (BR-8, BR-12). Acá comparo el :clientId
// de la URL con el X-Client-Id del usuario, y si no coinciden devuelvo 403.
//
// Ojo: si la ruta usa el id del recurso (ej. /pets/:id), esta guarda no puede saber
// de quién es esa mascota porque no tiene acceso a la BD. Eso lo tiene que revisar
// el service de cada microservicio.
//
// Si el rol no es owner no hace nada (vet, reception y admin pasan por RolesGuard).
@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;

    if (!user || user.role !== 'owner') {
      return true;
    }

    const routeClientId = request.params?.clientId;
    if (routeClientId && routeClientId !== user.clientId) {
      throw new ForbiddenException('No puedes acceder a recursos de otro cliente (BR-8, BR-12).');
    }

    return true;
  }
}
