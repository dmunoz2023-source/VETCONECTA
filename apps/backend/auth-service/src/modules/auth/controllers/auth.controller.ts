import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { LoginDTO } from '../dto/login.dto';
import { RegisterDTO } from '../dto/register.dto';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { AuthService } from '../services/auth.service';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDTO) {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDTO) {
    return await this.authService.validateUser(loginDto);
  }

  @Get('me')
  @UseGuards(JwtHeadersGuard)
  async getProfile(@CurrentUser() user: JwtPayload) {
    return {
      id: user.sub,
      correo: user.email,
      rol: user.role,
      clientId: user.clientId // Retornará el ID o undefined según el rol
    };
  }
}