import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDTO {
  // Se le sacan los espacios de los costados antes de validar el formato
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Debe ingresar su correo electrónico' })
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
  @MaxLength(254, { message: 'El correo electrónico no puede superar los 254 caracteres' })
  email!: string;

  // bcrypt solo lee los primeros 72 bytes, por eso ese es el máximo
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(72, { message: 'La contraseña no puede superar los 72 caracteres' })
  password!: string;
}
