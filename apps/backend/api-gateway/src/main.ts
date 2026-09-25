import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

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
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs-json', // el JSON del contrato, para que Mobile lo use
    customSiteTitle: 'VetConecta API - Swagger',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Microservicio ejecutándose en el puerto: ${port}`);
}
bootstrap();