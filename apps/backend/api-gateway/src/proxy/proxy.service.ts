import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { Request, Response } from 'express';
import { ClientRequest, IncomingMessage } from 'http';

interface RouteTarget {
  prefix: string;
  target: string;
}

// URL de cada microservicio (doc "Microservicios" §14.1). Se usa 127.0.0.1 y no
// "localhost" porque los servicios escuchan solo en la interfaz IPv4 local (§14.3).
const SERVICE_URLS = {
  auth: { env: 'SVC_AUTH_URL', fallback: 'http://127.0.0.1:3001' },
  clientsPets: { env: 'SVC_CLIENTS_URL', fallback: 'http://127.0.0.1:3002' },
  clinical: { env: 'SVC_CLINICAL_URL', fallback: 'http://127.0.0.1:3003' },
  scheduling: { env: 'SVC_SCHEDULING_URL', fallback: 'http://127.0.0.1:3004' },
  notifications: { env: 'SVC_NOTIFICATIONS_URL', fallback: 'http://127.0.0.1:3005' },
  catalog: { env: 'SVC_CATALOG_URL', fallback: 'http://127.0.0.1:3006' },
} as const;

type ServiceName = keyof typeof SERVICE_URLS;

@Injectable()
export class ProxyService {
  private readonly routes: RouteTarget[];
  private readonly serviceUrls: string[];

  constructor(private readonly configService: ConfigService) {
    const url = (name: ServiceName) =>
      this.configService.get<string>(SERVICE_URLS[name].env) || SERVICE_URLS[name].fallback;

    // Ruteo 1:1 por prefijo (doc "Microservicios" §2.3).
    this.routes = [
      { prefix: '/v1/auth', target: url('auth') },
      { prefix: '/v1/clients', target: url('clientsPets') },
      { prefix: '/v1/pets', target: url('clientsPets') },
      { prefix: '/v1/clinical', target: url('clinical') },
      { prefix: '/v1/scheduling', target: url('scheduling') },
      { prefix: '/v1/notifications', target: url('notifications') },
      { prefix: '/v1/catalog', target: url('catalog') },
    ];
    this.serviceUrls = (Object.keys(SERVICE_URLS) as ServiceName[]).map(url);
  }

  public getProxyMiddleware(route: RouteTarget) {
    const options: Options = {
      target: route.target,
      changeOrigin: true,
      on: {
        proxyReq: (proxyReq: ClientRequest, req: IncomingMessage) => {
          // 1. Inyección de traza y credenciales verificadas
          const headersToForward = ['x-request-id', 'x-user-id', 'x-user-role', 'x-client-id'];
          for (const header of headersToForward) {
            if (req.headers[header]) {
              proxyReq.setHeader(header, req.headers[header] as string);
            }
          }

          // 2. Resolver bloqueo de POST/PATCH: re-escribir req.body si Express lo parseó
          const expressReq = req as Request;
          if (expressReq.body && Object.keys(expressReq.body).length > 0) {
            const bodyData = JSON.stringify(expressReq.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
          }
        },
        error: (err: any, req: any, res: any) => {
          const expressRes = res as Response;
          const expressReq = req as Request;
          const isTimeout = err.code === 'ETIMEDOUT';
          const statusCode = isTimeout ? 504 : 502;
          const errorType = isTimeout ? 'GATEWAY_TIMEOUT' : 'BAD_GATEWAY';

          expressRes.status(statusCode).json({
            statusCode,
            error: errorType,
            message: `Servicio no disponible o tiempo de espera agotado: ${route.target}`,
            path: expressReq.originalUrl || expressReq.url,
            requestId: expressReq.headers?.['x-request-id'] || 'unknown',
            timestamp: new Date().toISOString(),
          });
        },
      },
    };

    return createProxyMiddleware(options);
  }

  public getRoutes(): RouteTarget[] {
    return this.routes;
  }

  /** URL base de cada uno de los seis microservicios (para agregar su Swagger). */
  public getServiceUrls(): string[] {
    return this.serviceUrls;
  }
}