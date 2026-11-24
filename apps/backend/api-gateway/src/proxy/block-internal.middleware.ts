import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HEADERS_PROXY_CONFIG } from '../config/headers.proxy.config';

@Injectable()
export class BlockInternalMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl.includes('/internal')) {
      return res.status(403).json({
        statusCode: 403,
        error: 'FORBIDDEN_RESOURCE',
        message: 'El acceso a rutas internas está restringido al tráfico inter-servicio.',
        path: req.originalUrl,
        requestId: (req.headers[HEADERS_PROXY_CONFIG.requestId] as string) || 'unknown',
        timestamp: new Date().toISOString(),
      });
    }
    next();
  }
}