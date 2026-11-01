import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { aggregateServiceDocs } from './swagger/swagger-aggregator';
import { exportOpenApiSpec } from './swagger/export-openapi-spec';
import { ProxyService } from './proxy/proxy.service';

// Orígenes web permitidos si no se define CORS_ORIGINS (panel React en desarrollo).
// La app React Native no usa CORS: solo aplica a clientes que corren en un navegador.
const DEFAULT_CORS_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

function corsOrigins(): string[] {
  const origins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return origins.length > 0 ? origins : DEFAULT_CORS_ORIGINS;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS para Frontend Web y Mobile
  app.enableCors({
    origin: corsOrigins(),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
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
  const missingServices = await aggregateServiceDocs(document, app.get(ProxyService).getServiceUrls());

  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs-json',
    customSiteTitle: 'VetConecta API - Swagger',
  });

  // El contrato exportado es el que consume Mobile: solo se sobrescribe si respondieron
  // los seis servicios, para no publicar un openapi.yaml incompleto.
  if (missingServices.length === 0) {
    exportOpenApiSpec(document);
  } else {
    console.warn(
      `openapi.yaml no se actualizó: no respondieron ${missingServices.join(', ')}.`,
    );
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API Gateway ejecutándose en http://localhost:${port}`);
}
bootstrap();