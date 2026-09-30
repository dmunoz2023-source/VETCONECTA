import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDTO {
  // En este atributo se ingresa el RUT o EMAIL del usuario
  @ApiProperty({
    type: String,
    example: 'vet@vetconecta.cl',
    description: 'RUT o correo electrónico del usuario.',
  })
  @IsString({ message: 'El identificador debe ser texto' })
  @IsNotEmpty({ message: 'Debe ingresar su RUT o correo electrónico' })
  identifier!: string;

  @ApiProperty({
    type: String,
    example: 'contrasena123',
    description: 'Contraseña del usuario.',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string; // Contraseña del usuario
}
