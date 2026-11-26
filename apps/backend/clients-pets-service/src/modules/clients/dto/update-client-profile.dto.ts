import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateClientProfileDto {
  @ApiPropertyOptional({ example: 'ana.nueva@correo.cl' })
  @IsEmail({}, { message: 'El correo electrónico debe ser un email válido' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+56987654321' })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Calle Prat 456' })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Padre Las Casas' })
  @IsString({ message: 'La comuna o distrito debe ser una cadena de texto' })
  @IsOptional()
  district?: string;

  // Propiedades opcionales para capturar y validar intentos de modificación indebida (BR-15)
  @ApiPropertyOptional({ description: 'Campo protegido (BR-15): enviarlo responde 403.' })
  @IsOptional()
  rut?: string;

  @ApiPropertyOptional({ description: 'Campo protegido (BR-15): enviarlo responde 403.' })
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Campo protegido (BR-15): enviarlo responde 403.' })
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Campo protegido (BR-15): enviarlo responde 403.' })
  @IsOptional()
  nombres?: string;

  @ApiPropertyOptional({ description: 'Campo protegido (BR-15): enviarlo responde 403.' })
  @IsOptional()
  apellidos?: string;
}