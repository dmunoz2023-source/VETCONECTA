import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { RequestTraceMiddleware } from './request-trace.middleware';
import { BlockInternalMiddleware } from './block-internal.middleware';

@Module({
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule implements NestModule {
  constructor(private readonly proxyService: ProxyService) {}

  configure(consumer: MiddlewareConsumer) {
    // 1. Trazabilidad y bloqueo perimetral en todas las rutas
    consumer
      .apply(RequestTraceMiddleware, BlockInternalMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // 2. Mapeo del proxy para la raíz del prefijo y cualquier subruta
    for (const route of this.proxyService.getRoutes()) {
      // Normalizamos quitando la barra inicial para el matcher de NestJS
      const cleanPrefix = route.prefix.replace(/^\//, '');

      consumer
        .apply(this.proxyService.getProxyMiddleware(route))
        .forRoutes(
          { path: cleanPrefix, method: RequestMethod.ALL },
          { path: `${cleanPrefix}/*`, method: RequestMethod.ALL },
        );
    }
  }
}