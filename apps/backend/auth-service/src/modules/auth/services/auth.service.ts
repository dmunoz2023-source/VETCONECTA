import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { RegisterDTO } from '../dto/register.dto';
import { LoginDTO } from '../dto/login.dto';
import { UserRole } from '../entities/user.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly httpService: HttpService, // Inyectado para consultar el servicio de clientes por RUT
  ) {}

  async register(registerDto: RegisterDTO) {
    // 1. Verificar si el correo ya existe
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya se encuentra registrado');
    }

    // 2. Hashear contraseña con COST FACTOR = 12 (requerimiento B2.1)
    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    // 3. Crear usuario con rol por defecto 'owner'
    const newUser = await this.userRepository.create({
      ...registerDto,
      passwordHash,
      role: registerDto.role || UserRole.OWNER, // 'owner' por defecto
    });

    const { passwordHash: _, ...result } = newUser;
    return result;
  }

  async login(loginDto: LoginDTO) {
    const { identifier, password } = loginDto;
    let user: User | null = null;

    // 1. Si es email (contiene @), buscar directamente por correo
    if (identifier.includes('@')) {
      user = await this.userRepository.findByEmail(identifier);
    } else {
      // 2. Si es RUT, llamar al microservicio interno de clientes (puerto 3002)
      try {
        const url = `http://localhost:3002/internal/clients/by-rut/${identifier}`;
        const response = await firstValueFrom(this.httpService.get(url));
        const userId = response.data?.user_id;

        if (userId) {
          user = await this.userRepository.findById(userId);
        }
      } catch (error) {
        throw new UnauthorizedException('Credenciales inválidas');
      }
    }

    // 3. Si no existe el usuario, lanzar excepción
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Validar contraseña con bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return user;
  }
}