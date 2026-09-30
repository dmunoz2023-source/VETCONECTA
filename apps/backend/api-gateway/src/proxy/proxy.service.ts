import { Injectable } from '@nestjs/common';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { Request, Response } from 'express';
import { ClientRequest, IncomingMessage } from 'http';

interface RouteTarget {
  prefix: string;
  target: string;
}

@Injectable()
export class ProxyService {
  private readonly routes: RouteTarget[] = [
    { prefix: '/v1/auth', target: 'http://localhost:3001' },
    { prefix: '/v1/clients', target: 'http://localhost:3002' },
    { prefix: '/v1/pets', target: 'http://localhost:3002' },
    { prefix: '/v1/clinical', target: 'http://localhost:3003' },
    { prefix: '/v1/scheduling', target: 'http://localhost:3004' },
    { prefix: '/v1/notifications', target: 'http://localhost:3005' },
    { prefix: '/v1/catalog', target: 'http://localhost:3006' },
  ];

  public getProxyMiddleware(route: RouteTarget) {
    const options: Options = {
      target: route.target,
      changeOrigin: true,
      on: {
        // req tipado como IncomingMessage para satisfacer la firma de http-proxy-middleware
        proxyReq: (proxyReq: ClientRequest, req: IncomingMessage) => {
          const traceId = req.headers['x-request-id'];
          if (traceId) {
            proxyReq.setHeader('x-request-id', traceId as string);
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
}