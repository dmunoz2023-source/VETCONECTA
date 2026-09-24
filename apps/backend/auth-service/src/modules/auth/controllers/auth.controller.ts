import { Controller, Post, Get, Body } from '@nestjs/common';
import { LoginDTO } from '../dto/login.dto';
import { RegisterDTO } from '../dto/register.dto';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';

// Jeremy: Esta es la linea que debes descomentar para agregar el AuthService
// import { AuthService } from '../services/auth.service'; 

@Controller('v1/auth') // Endpoint para conexión con el controlador del microservicio Auth
export class AuthController {
  // constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDTO) {
    // Aquí debes conectar el authservice con el register: return await this.authService.register(registerDto);
    return { // esto es un ejemplo
      message: 'Estructura de registro lista para integrar',
      dataRecibida: registerDto 
    };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDTO) {
    // Aquí debes conectar el authservice con el login: return await this.authService.login(loginDto);
    return {  // esto es un ejemplo
      token: 'jwt_placeholder',
      message: 'Estructura de login lista para integrar'
    };
  }

  // Implemento el decorador @CurrentUser() en el endpoint GET v1/auth/me, esto es deacuerdo los documento de MicroServicios y SRS
  @Get('me')
  async getProfile(@CurrentUser() user: JwtPayload) {
    return {
      id: user.sub, 
      correo: user.email, 
      rol: user.role,
      clientId: user.clientId // Retornará el ID o undefined según el rol
    };
  }
}