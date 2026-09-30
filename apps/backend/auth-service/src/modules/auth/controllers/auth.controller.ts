import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDTO } from '../dto/login.dto';
import { RegisterDTO } from '../dto/register.dto';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Controller('v1/auth') // Endpoint para conexión con el controlador del microservicio Auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar un dueño',
    description:
      'Público. Registra un dueño con rol owner (FR-1). Por ahora responde con una estructura de ' +
      'ejemplo; la creación real de la cuenta llega con el AuthService.',
  })
  @ApiCreatedResponse({
    description: 'Estructura de registro lista para integrar.',
    schema: {
      example: {
        message: 'Estructura de registro lista para integrar',
        dataRecibida: { email: 'dueno@vetconecta.cl', password: 'contrasena123' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Cuerpo mal formado o campos inválidos.' })
  async register(@Body() registerDto: RegisterDTO) {
    // Aquí debes conectar el authservice con el register: return await this.authService.register(registerDto);
    return { // esto es un ejemplo
      message: 'Estructura de registro lista para integrar',
      dataRecibida: registerDto
    };
  }

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Público. Sirve tanto a dueños como a personal clínico (FR-1, FR-13, BR-14). Por ahora ' +
      'responde con un token de ejemplo; la emisión real del JWT llega con el AuthService.',
  })
  @ApiCreatedResponse({
    description: 'Estructura de login lista para integrar.',
    schema: {
      example: {
        token: 'jwt_placeholder',
        message: 'Estructura de login lista para integrar',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Cuerpo mal formado o campos inválidos.' })
  async login(@Body() loginDto: LoginDTO) {
    return await this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtHeadersGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener el usuario autenticado',
    description:
      'Todos los roles. Devuelve id, correo, rol y clientId (solo si es owner) del usuario que ' +
      'hace la petición (FR-1).',
  })
  @ApiOkResponse({
    description: 'Datos del usuario autenticado.',
    schema: {
      example: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        correo: 'dueno@vetconecta.cl',
        rol: 'owner',
        clientId: '22222222-2222-2222-2222-222222222222',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Falta el token o venció.' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return {
      id: user.sub,
      email: user.email,
      rol: user.role,
      clientId: user.clientId // Retornará el ID o undefined según el rol
    };
  }
}
