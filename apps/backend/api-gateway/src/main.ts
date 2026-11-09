import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@app/shared/filters/http-exception.filter';
import { AppModule } from './app.module';
import { aggregateServiceDocs } from './swagger/swagger-aggregator';
import { exportOpenApiSpec } from './swagger/export-openapi-spec';
import { HEADERS_PROXY_CONFIG } from './config/headers.proxy.config';

const web_url = process.env.FRONTEND_WEB_ORIGIN_URL || 'http://localhost:5173'
const movile_url = process.env.FRONTEND_MOVILE_ORIGIN_URL || 'http://127.0.0.1:5173'

const {
  requestId
} = HEADERS_PROXY_CONFIG;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // [J3] Formato de error único en todas las respuestas (Diseño §3.3).
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuración de CORS para Frontend Web y Mobile
  app.enableCors({
    origin: [web_url, movile_url],
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

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API Gateway ejecutándose en http://localhost:${port}`);
}
bootstrap();