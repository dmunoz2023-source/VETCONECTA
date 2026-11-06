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
    const internalKey = request.headers['x-internal-key'];
    const expectedSecret = process.env.INTERNAL_API_KEY || process.env.INTERNAL_KEY;

    if (!internalKey || internalKey !== expectedSecret) {
      throw new UnauthorizedException(
        'Acceso denegado: cabecera interna invalida o no proporcionada.',
      );
    }

    return true;
  }
}