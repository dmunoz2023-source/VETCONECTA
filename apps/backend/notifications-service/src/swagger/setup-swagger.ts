import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupNotificationsSwagger(app: INestApplication): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('VetConecta - Notifications Service')
    .setDescription('API para vincular dispositivos y gestionar notificaciones.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs-json',
    swaggerUiEnabled: false,
  });
}
