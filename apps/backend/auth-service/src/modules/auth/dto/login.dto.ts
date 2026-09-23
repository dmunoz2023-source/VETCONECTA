import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDTO {
  // En este atributo se ingresa el RUT o EMAIL del usuario 
  @IsString({ message: 'El identificador debe ser texto' })
  @IsNotEmpty({ message: 'Debe ingresar su RUT o correo electrónico' })
  identifier!: string;

  @IsString()
  @MinLength(6)
  password!: string; // Contraseña del usuario
}