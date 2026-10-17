import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
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

  const port = process.env.PORT || 3003;
  // Solo en la interfaz local: el único acceso externo es el API Gateway :3000 (Diseño §14.3).
  await app.listen(port, '127.0.0.1');
  console.log(`Microservicio ejecutándose en el puerto: ${port}`);
}
bootstrap();