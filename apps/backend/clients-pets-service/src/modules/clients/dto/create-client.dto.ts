import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: '12.345.678-9', description: 'RUT chileno, con o sin puntos. Único en el sistema.' })
  @IsString({ message: 'El RUT debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El RUT es obligatorio' })
  @Matches(/^(\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]|\d{7,8}[-][0-9kK])$/, {
    message: 'El RUT debe tener un formato válido (ej: 12345678-9 o 12.345.678-K)',
  })
  rut!: string;

  @ApiProperty({ example: 'Ana' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  firstName!: string;

  @ApiProperty({ example: 'Soto Pérez' })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  lastName!: string;

  @ApiProperty({ example: 'ana@correo.cl' })
  @IsEmail({}, { message: 'El correo electrónico debe ser un email válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email!: string;

  @ApiPropertyOptional({ example: '+56912345678' })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Av. Alemania 1234' })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Temuco' })
  @IsString({ message: 'La comuna o distrito debe ser una cadena de texto' })
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ example: '9f1c2b7e-3a4d-4c5e-8f60-1a2b3c4d5e6f', description: 'Id de la cuenta en auth-service, si ya existe.' })
  @IsUUID('4', { message: 'El userId debe ser un UUID v4 válido' })
  @IsOptional()
  userId?: string;
}