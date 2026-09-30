import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response, NextFunction } from 'express';
import { isPublicRoute } from './public-routes';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate, NestMiddleware {
  private static readonly IDENTITY_HEADERS = [
    'x-user-id',
    'x-user-role',
    'x-client-id',
  ];

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // 1. Soporte para Nest Guard (mantiene los tests unitarios en verde)
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    this.processAuthentication(request);
    return true;
  }

  // 2. Soporte para Middleware (ejecución real previa al proxy)
  use(req: Request, res: Response, next: NextFunction) {
    try {
      this.processAuthentication(req);
      next();
    } catch (err: any) {
      return res.status(err.getStatus ? err.getStatus() : 401).json({
        statusCode: 401,
        error: 'UNAUTHORIZED',
        message: err.message || 'Token inválido o expirado.',
        path: req.originalUrl,
        requestId: (req.headers['x-request-id'] as string) || 'unknown',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public processAuthentication(request: Request): void {
    // Anti-spoofing perimetral
    this.stripIdentityHeaders(request);

    const url = request.originalUrl ?? request.url;
    if (!isPublicRoute(request.method, url)) {
      const payload = this.verifyToken(this.extractBearerToken(request));
      request.headers['x-user-id'] = payload.sub;
      request.headers['x-user-role'] = payload.role;
      if (payload.role === 'owner' && payload.clientId) {
        request.headers['x-client-id'] = payload.clientId;
      }
      (request as Request & { user?: JwtPayload }).user = payload;
    }
  }

  private stripIdentityHeaders(request: Request): void {
    for (const header of JwtAuthGuard.IDENTITY_HEADERS) {
      delete request.headers[header];
    }
  }

  private extractBearerToken(request: Request): string {
    const authorization = request.headers['authorization'];
    if (!authorization?.startsWith('Bearer ')) {
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
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }
}