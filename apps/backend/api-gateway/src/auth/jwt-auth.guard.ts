import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { isPublicRoute } from './public-routes';
import { JwtPayload } from './jwt-payload.interface';

/**
 * Terminacion de autenticacion del API Gateway (NFR-3).
 *
 * Orden de trabajo por cada peticion entrante:
 *  1. Elimina SIEMPRE cualquier cabecera de identidad que traiga el cliente
 *     externo (X-User-Id / X-User-Role / X-Client-Id). El Gateway es la unica
 *     fuente confiable de esas cabeceras; nunca se confia en el cliente.
 *  2. Si la ruta esta en la whitelist publica, deja pasar sin token.
 *  3. Valida firma y expiracion del Bearer con el JWT_SECRET compartido.
 *  4. Con el payload valido, inyecta las cabeceras de identidad confiables que
 *     los microservicios leen via JwtHeadersGuard. X-Client-Id solo si es owner.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  // Cabeceras de identidad que el Gateway controla en exclusiva.
  private static readonly IDENTITY_HEADERS = [
    'x-user-id',
    'x-user-role',
    'x-client-id',
  ];

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Anti-spoofing: descarta lo que el cliente haya intentado inyectar.
    this.stripIdentityHeaders(request);

    // 2. Rutas publicas: no requieren token.
    const url = request.originalUrl ?? request.url;
    if (isPublicRoute(request.method, url)) {
      return true;
    }

    // 3. Extrae y valida el Bearer.
    const payload = this.verifyToken(this.extractBearerToken(request));

    // 4. Inyecta las cabeceras de identidad confiables.
    request.headers['x-user-id'] = payload.sub;
    request.headers['x-user-role'] = payload.role;
    if (payload.role === 'owner' && payload.clientId) {
      request.headers['x-client-id'] = payload.clientId;
    }

    (request as Request & { user?: JwtPayload }).user = payload;
    return true;
  }

  private stripIdentityHeaders(request: Request): void {
    for (const header of JwtAuthGuard.IDENTITY_HEADERS) {
      delete request.headers[header];
    }
  }

  private extractBearerToken(request: Request): string {
    const authorization = request.headers['authorization'];
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta el token Bearer.');
    }
    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Falta el token Bearer.');
    }
    return token;
  }

  private verifyToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Token invalido o expirado.');
    }
  }
}
