import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@app/shared/filters/http-exception.filter';
import { AppModule } from './app.module';
import { aggregateServiceDocs } from './swagger/swagger-aggregator';
import { exportOpenApiSpec } from './swagger/export-openapi-spec';
import { HEADERS_PROXY_CONFIG } from './config/headers.proxy.config';

const {
  requestId
} = HEADERS_PROXY_CONFIG;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const origins = config
    .getOrThrow<string>('CORS_ORIGIN')
    .split(',')
    .map((o) => o.trim());

  // [J3] Formato de error único en todas las respuestas (Diseño §3.3).
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuración de CORS para Frontend Web y Mobile
  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', requestId],
    exposedHeaders: [requestId],
    credentials: true,
  });

  // Documentación Swagger en http://localhost:3000/docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('VetConecta API')
    .setDescription('Contrato de la API de VetConecta para las apps web y mobile.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  await aggregateServiceDocs(document);

  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs-json',
    customSiteTitle: 'VetConecta API - Swagger',
  });

  exportOpenApiSpec(document);

  const port = config.getOrThrow<number>('PORT');
  await app.listen(port);
  console.log(`API Gateway ejecutándose en http://localhost:${port}`);
}
bootstrap();