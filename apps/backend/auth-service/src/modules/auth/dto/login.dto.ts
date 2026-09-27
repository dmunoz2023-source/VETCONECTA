import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDTO {
  // En este atributo se ingresa el RUT o EMAIL del usuario
  // Se le sacan los espacios de los costados antes de validar
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'El identificador debe ser texto' })
  @IsNotEmpty({ message: 'Debe ingresar su RUT o correo electrónico' })
  @MaxLength(254, { message: 'El identificador no puede superar los 254 caracteres' })
  identifier!: string;

  // bcrypt solo lee los primeros 72 bytes, por eso ese es el máximo
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(72, { message: 'La contraseña no puede superar los 72 caracteres' })
  password!: string; // Contraseña del usuario
}
