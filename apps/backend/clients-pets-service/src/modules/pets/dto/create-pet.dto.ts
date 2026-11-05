import { IsString, IsNotEmpty, IsUUID, IsOptional, IsBoolean, IsDateString, Matches } from 'class-validator';

export class CreatePetDto {
  @IsUUID('4', { message: 'El ID del cliente debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del cliente es obligatorio' })
  clientId!: string;

  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name!: string;

  @IsString({ message: 'La especie debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La especie es obligatoria' })
  species!: string;

  @IsString({ message: 'La raza debe ser una cadena de texto' })
  @IsOptional()
  breed?: string;

  @IsString({ message: 'El sexo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El sexo es obligatorio' })
  sex!: string;

  @IsDateString({}, { message: 'La fecha de nacimiento debe tener un formato de fecha válido (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  birthDate!: string;

  @IsString({ message: 'El color debe ser una cadena de texto' })
  @IsOptional()
  color?: string;

  @IsString({ message: 'El microchip debe ser una cadena de texto' })
  @IsOptional()
  microchip?: string;

  @IsString({ message: 'La URL de la foto debe ser una cadena de texto' })
  @IsOptional()
  photoUrl?: string;
}