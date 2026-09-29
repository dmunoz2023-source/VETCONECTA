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

  // 1. Método de Registro
  // El tipo de retorno ahora omite 'passwordHash' en lugar de 'password'
  async register(registerDto: RegisterDTO): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado');
    }

    // Hashear la contraseña en texto plano
    const hashedPassword = await bcrypt.hash(registerDto.password, this.SALT_ROUNDS);

    // se le pasan todos los nuevos campos del DTO al repositorio
    // y se guarda como passwordHash en lugar de password
    const newUser = await this.userRepository.create({
      rut: registerDto.rut,
      fullName: registerDto.fullName,
      email: registerDto.email,
      phone: registerDto.phone,
      address: registerDto.address,
      role: registerDto.role,
      passwordHash: hashedPassword,
    });

    // Excluimos passwordHash en lugar de password por seguridad
    const { passwordHash, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // 2. Método de Validación de Credenciales (Login)
  // MODIFICADO: El tipo de retorno omite 'passwordHash'
  async validateUser(loginDto: LoginDTO): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findByEmail(loginDto.identifier);

    // Si el usuario no existe, lanzamos UnauthorizedException
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // MODIFICADO: Se compara contra user.passwordHash (propiedad real de la entidad)
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // MODIFICADO: Se excluye passwordHash antes de devolver la información
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}