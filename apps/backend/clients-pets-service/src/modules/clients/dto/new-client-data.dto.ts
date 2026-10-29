import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

/**
 * [A3] Contrato de entrada para dar de alta un cliente.
 * `id` lo genera la BD y `active` arranca en true por defecto, por eso no
 * forman parte del contrato de creación.
 */
export class NewClientDataDTO {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'ID del usuario (auth) dueño de esta ficha de cliente.',
  })
  @IsUUID()
  userId!: string;

  @ApiProperty({ type: String, example: '12.345.678-9', description: 'RUT del cliente.' })
  @IsString()
  @IsNotEmpty()
  rut!: string;

  @ApiProperty({ type: String, example: 'Juan', description: 'Nombre del cliente.' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ type: String, example: 'Pérez', description: 'Apellido del cliente.' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({
    type: String,
    example: 'dueno@vetconecta.cl',
    description: 'Correo electrónico del cliente.',
  })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ type: String, example: '+56912345678', description: 'Teléfono de contacto.' })
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiPropertyOptional({ type: String, example: 'Av. Siempre Viva 123', description: 'Dirección del cliente.' })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiPropertyOptional({ type: String, example: 'Temuco', description: 'Comuna/distrito del cliente.' })
  @IsOptional()
  @IsString()
  district?: string | null;
}
