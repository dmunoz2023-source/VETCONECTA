import { Controller, Post, Body } from '@nestjs/common';
import { LoginDTO } from '../dto/login.dto';
import { RegisterDTO } from '../dto/register.dto';

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
}