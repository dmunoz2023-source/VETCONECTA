import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

// Cada microservicio publica su contrato en /docs-json y el gateway los junta en un solo /docs.
// Si un servicio no está levantado o todavía no publica su contrato, simplemente se salta.
const SERVICE_DOCS_URLS = [
  'http://localhost:3001/docs-json', // auth-service
  'http://localhost:3002/docs-json', // clients-pets-service
  'http://localhost:3003/docs-json', // clinical-records-service
  'http://localhost:3004/docs-json', // scheduling-service
  'http://localhost:3005/docs-json', // notifications-service
  'http://localhost:3006/docs-json', // clinic-catalog-service
];

async function fetchServiceDocument(url: string): Promise<OpenAPIObject | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
    if (!response.ok) return null;
    return (await response.json()) as OpenAPIObject;
  } catch {
    return null;
  }
}

function mergeDocuments(target: OpenAPIObject, source: OpenAPIObject): void {
  target.paths = { ...target.paths, ...source.paths };
  target.components = target.components ?? {};
  target.components.schemas = {
    ...target.components.schemas,
    ...source.components?.schemas,
  };
  target.tags = [...(target.tags ?? []), ...(source.tags ?? [])];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Documentación Swagger, se ve en http://localhost:3000/docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('VetConecta API')
    .setDescription('Contrato de la API de VetConecta para las apps web y mobile.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  const serviceDocuments = await Promise.all(SERVICE_DOCS_URLS.map(fetchServiceDocument));
  for (const serviceDocument of serviceDocuments) {
    if (serviceDocument) mergeDocuments(document, serviceDocument);
  }

  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs-json', // el JSON del contrato, para que Mobile lo use
    customSiteTitle: 'VetConecta API - Swagger',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Microservicio ejecutándose en el puerto: ${port}`);
}
bootstrap();