import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ERROR_RESPONSE_SCHEMA } from '@app/shared/swagger/error-response.schema';
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
      'Público. Registra un dueño con rol owner (FR-1). PENDIENTE DE INTEGRAR: el controlador todavía ' +
      'no llama a AuthService.register, así que hoy solo devuelve el cuerpo recibido y NO crea la cuenta. ' +
      'Cuando se conecte, el correo repetido responderá 409.',
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
  @ApiBadRequestResponse({ description: 'VALIDATION_ERROR: cuerpo mal formado o campos inválidos.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiConflictResponse({ description: 'CONFLICT: el correo ya está registrado (cuando se integre AuthService.register).', schema: ERROR_RESPONSE_SCHEMA })
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
      'Público. Sirve tanto a dueños como a personal clínico (FR-1, FR-13, BR-14). `identifier` es el ' +
      'correo o el RUT. Devuelve los datos del usuario (sin la contraseña) y el `accessToken` JWT, que ' +
      'se envía como `Authorization: Bearer <token>`; el rol del usuario viaja dentro del token.',
  })
  @ApiCreatedResponse({
    description: 'Credenciales válidas.',
    schema: {
      example: {
        id: '55555555-5555-5555-5555-555555555551',
        email: 'veterinario@vetconecta.cl',
        role: 'vet',
        status: 'active',
        emailVerifiedAt: null,
        lastLoginAt: '2026-11-25T14:21:03.512Z',
        createdAt: '2026-11-01T12:00:00.000Z',
        updatedAt: '2026-11-25T14:21:03.512Z',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'VALIDATION_ERROR: cuerpo mal formado o campos inválidos.', schema: ERROR_RESPONSE_SCHEMA })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: credenciales inválidas (correo, RUT o contraseña incorrectos).', schema: ERROR_RESPONSE_SCHEMA })
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
        email: 'dueno@vetconecta.cl',
        rol: 'owner',
        clientId: '22222222-2222-2222-2222-222222222222',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED: falta el token o venció.', schema: ERROR_RESPONSE_SCHEMA })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return {
      id: user.sub,
      email: user.email,
      rol: user.role,
      clientId: user.clientId // Retornará el ID o undefined según el rol
    };
  }
}
