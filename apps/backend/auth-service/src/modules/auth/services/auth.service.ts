// src/modules/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { RegisterDTO } from '../dto/register.dto';
import { LoginDTO } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Registro de un nuevo usuario con rol predeterminado OWNER
   */
  async register(registerDto: RegisterDTO) {
    const { email, password } = registerDto;

    // 1. Verificar si el correo ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(
        'El correo electrónico ya se encuentra registrado',
      );
    }

    // 2. Hashear la contraseña con bcrypt (factor de costo 12)
    const passwordHash = await bcrypt.hash(password, 12);

    // 3. Crear entidad asignando rol 'owner' y estado 'active'
    const newUser = this.userRepository.create({
      email,
      passwordHash,
      role: UserRole.OWNER,
      status: 'active',
    });

    const savedUser = await this.userRepository.save(newUser);

    // 4. Omitir el hash de la contraseña en el objeto retornado
    const { passwordHash: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  /**
   * Login soportando Correo Electrónico o RUT
   */
  async login(loginDto: LoginDTO) {
    const { identifier, password } = loginDto;
    let user: User | null = null;

    // 1. Si es email (contiene @), buscar directamente en la BD
    if (identifier.includes('@')) {
      user = await this.userRepository.findOne({
        where: { email: identifier },
      });
    } else {
      // 2. Si es RUT, consultar al microservicio interno 'clients-service'
      try {
        const baseUrl = this.configService.get<string>('clientsServiceUrl');
        const url = `${baseUrl}/v1/clients/id/${identifier}`;
        const response = await firstValueFrom(this.httpService.get(url));
        const userId = response.data?.user_id;

        if (userId) {
          user = await this.userRepository.findOne({
            where: { id: userId },
          });
        }
      } catch (error) {
        throw new UnauthorizedException('Credenciales inválidas');
      }
    }

    // 3. Validar si existe el usuario
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Comparar contraseñas
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 5. Actualizar última fecha de ingreso
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // 6. Retornar datos de usuario excluyendo el hash de la contraseña
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}