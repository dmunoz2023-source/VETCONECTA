import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDTO {
  @ApiProperty({
    type: String,
    example: 'dueno@vetconecta.cl',
    description: 'Correo electrónico del nuevo usuario.',
  })
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
  email!: string;

  @ApiProperty({
    type: String,
    example: 'contrasena123',
    description: 'Contraseña del nuevo usuario.',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}