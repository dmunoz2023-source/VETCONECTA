import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilita CORS si se consume desde el frontend React
  app.enableCors();

  const port = process.env.PORT || 3002;  
  await app.listen(port);
  
  console.log(`🚀 clients-pets-service corriendo en: http://localhost:${port}`);
}
bootstrap();