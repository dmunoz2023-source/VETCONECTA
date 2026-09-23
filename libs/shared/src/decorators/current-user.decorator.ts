import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// Importo la interfaz del JWT Payload para el decorador
import { JwtPayload } from '../types/jwt-payload.interface';

// Decorador para acceder al usuario actual
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    // Si JwtHeadersGuard pasó, request.user existirá
    if (!user) {
      return null;
    }

    // Si se pide una propiedad específica (ej: @CurrentUser('role')), retorna solo eso
    // Si no se pide nada (ej: @CurrentUser()), retorna el objeto entero
    return data ? user[data] : user;
  },
);