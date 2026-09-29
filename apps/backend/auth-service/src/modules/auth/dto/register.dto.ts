import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
// Asegúrate de ajustar la ruta de importación de UserRole según dónde esté tu entidad User
import { UserRole } from '../entities/user.entity';

export class RegisterDTO {
  // (Reglas de Negocio BR-15)

  // Requerido por BR-15 (Identificador legal único)
  @IsString({ message: 'El RUT debe ser una cadena de texto válida' })
  rut!: string;

  // Requerido para el nombre del usuario
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  fullName!: string;

  // CAMPOS ORIGINALES DANIEL
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  // CAMPOS OPCIONALES AGREGADOS (Reglas de Negocio BR-14 y BR-15)

  // R-15 (Dato de contacto editable)
  @IsOptional()
  @IsString()
  phone?: string;

  //  BR-15 (Dato de contacto editable)
  @IsOptional()
  @IsString()
  address?: string;

  // BR-14 (Clasificación de roles: admin, vet, reception, owner)
  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol ingresado no es válido' })
  role?: UserRole;
}