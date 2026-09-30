import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { RequestTraceMiddleware } from './request-trace.middleware';
import { BlockInternalMiddleware } from './block-internal.middleware';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule implements NestModule {
  constructor(private readonly proxyService: ProxyService) {}

  configure(consumer: MiddlewareConsumer) {
    // 1. Trazabilidad, bloqueo perimetral y validación JWT
    consumer
      .apply(RequestTraceMiddleware, BlockInternalMiddleware, JwtAuthGuard)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // 2. Mapeo del proxy inverso para cada microservicio
    for (const route of this.proxyService.getRoutes()) {
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