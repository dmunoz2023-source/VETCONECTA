import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
// import { AuthService } from './services/auth.service';

// Configuración de JWT para expiración del token en 15 min
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // El JWT_SECRET se debe obtener de las variables de entorno (.env)
        secret: configService.get<string>('JWT_SECRET'), 
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  // providers: [AuthService], // Jeremy este comentario debes descomentarlo para activar el servicio
})
export class AuthModule {}