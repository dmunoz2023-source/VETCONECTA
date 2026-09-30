import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { aggregateServiceDocs } from './swagger/swagger-aggregator';
import { exportOpenApiSpec } from './swagger/export-openapi-spec';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS para Frontend Web y Mobile
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
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