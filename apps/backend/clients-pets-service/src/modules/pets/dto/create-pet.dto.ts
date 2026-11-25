import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsBoolean, IsDateString, Matches } from 'class-validator';

export class CreatePetDto {
  @ApiProperty({ example: '22222222-2222-2222-2222-222222222222', description: 'UUID del cliente dueño (BR-1).' })
  @Matches(/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i, {
    message: 'El ID del cliente debe tener formato UUID',
  })
  @IsNotEmpty({ message: 'El ID del cliente es obligatorio' })
  clientId!: string;

  @ApiProperty({ example: 'Polo' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name!: string;

  @ApiProperty({ example: 'dog', description: 'Especie, en inglés (dog, cat, ...).' })
  @IsString({ message: 'La especie debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La especie es obligatoria' })
  species!: string;

  @ApiPropertyOptional({ example: 'Labrador' })
  @IsString({ message: 'La raza debe ser una cadena de texto' })
  @IsOptional()
  breed?: string;

  @ApiProperty({ example: 'male' })
  @IsString({ message: 'El sexo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El sexo es obligatorio' })
  sex!: string;

  @ApiProperty({ example: '2021-08-20', description: 'YYYY-MM-DD. No puede ser futura. La edad se calcula al vuelo (BR-2).' })
  @IsDateString({}, { message: 'La fecha de nacimiento debe tener un formato de fecha válido (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  birthDate!: string;

  @ApiPropertyOptional({ example: 'Café' })
  @IsString({ message: 'El color debe ser una cadena de texto' })
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: '985112345678901' })
  @IsString({ message: 'El microchip debe ser una cadena de texto' })
  @IsOptional()
  microchip?: string;

  @ApiPropertyOptional({ example: 'https://cdn.vetconecta.cl/pets/polo.jpg' })
  @IsString({ message: 'La URL de la foto debe ser una cadena de texto' })
  @IsOptional()
  photoUrl?: string;
}