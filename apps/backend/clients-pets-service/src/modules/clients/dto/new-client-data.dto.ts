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
  @IsUUID()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  rut!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsString()
  address?: string | null;

  @IsOptional()
  @IsString()
  district?: string | null;
}
