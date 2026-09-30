import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

(async function () {
  const app = await NestFactory.create(AppModule);

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Solo publica el contrato en JSON (/docs-json). La interfaz de Swagger vive en el api-gateway
  const swaggerConfig = new DocumentBuilder()
    .setTitle('VetConecta - Auth Service')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs-json',
    swaggerUiEnabled: false,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Microservicio ejecutándose en el puerto: ${port}`);
})();