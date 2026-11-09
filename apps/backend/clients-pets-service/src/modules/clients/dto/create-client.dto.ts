import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateClientDto {
  @IsString({ message: 'El RUT debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El RUT es obligatorio' })
  @Matches(/^(\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]|\d{7,8}[-][0-9kK])$/, {
    message: 'El RUT debe tener un formato válido (ej: 12345678-9 o 12.345.678-K)',
  })
  rut!: string;

  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  firstName!: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  lastName!: string;

  @IsEmail({}, { message: 'El correo electrónico debe ser un email válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email!: string;

  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsOptional()
  phone?: string;

  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsOptional()
  address?: string;

  @IsString({ message: 'La comuna o distrito debe ser una cadena de texto' })
  @IsOptional()
  district?: string;

  @IsUUID('4', { message: 'El userId debe ser un UUID v4 válido' })
  @IsOptional()
  userId?: string;
}