import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDTO } from '../dto/register.dto';
import { LoginDTO } from '../dto/login.dto';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly userRepository: UserRepository) {}

  // 1. Método de Registro: Hashea la contraseña con bcrypt antes de guardar
  async register(registerDto: RegisterDTO): Promise<Omit<User, 'password'>> {
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado');
    }

    // Hashear la contraseña en texto plano
    const hashedPassword = await bcrypt.hash(registerDto.password, this.SALT_ROUNDS);

    const newUser = await this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
    });

    // Retornamos el usuario excluyendo el hash de la contraseña por seguridad
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // 2. Método de Validación de Credenciales (Login)
  async validateUser(loginDto: LoginDTO): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findByEmail(loginDto.identifier);

    // Si el usuario no existe, lanzamos UnauthorizedException
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Comparar la contraseña ingresada en texto plano contra el hash guardado
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}