import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity'; 
import { HttpModule } from '@nestjs/axios'; 

// Configuración de JWT para expiración del token en 15 min
@Module({
  imports: [
    HttpModule,
    // AGREGADO: Vincula la entidad User con TypeORM para este módulo
    TypeOrmModule.forFeature([User]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // El JWT_SECRET se obtiene de las variables de entorno (.env)
        secret: configService.get<string>('JWT_SECRET') || 'secretKeyPlaceholder', 
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository],
  exports: [AuthService, UserRepository],
})
export class AuthModule {}