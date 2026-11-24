import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateClientProfileDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser un email válido' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsOptional()
  phone?: string;

  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsOptional()
  address?: string;

  @IsString({ message: 'La comuna o distrito debe ser una cadena de texto' })
  @IsOptional()
  district?: string;

  // Propiedades opcionales para capturar y validar intentos de modificación indebida (BR-15)
  @IsOptional()
  rut?: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  nombres?: string;

  @IsOptional()
  apellidos?: string;
}