import { IsUUID, IsEnum, IsString, IsNotEmpty, IsNumber, Min, IsDateString, IsOptional } from 'class-validator';

export enum ClinicalEventType {
  CONSULTA = 'CONSULTA',
  VACUNA = 'VACUNA',
  CONTROL = 'CONTROL',
}

export class CreateClinicalEventDto {
  @IsUUID('4', { message: 'El ID de la mascota debe ser un UUID válido' })
  @IsNotEmpty()
  mascotaId!: string;

  @IsEnum(ClinicalEventType, { message: 'El tipo debe ser CONSULTA, VACUNA o CONTROL' })
  @IsNotEmpty()
  tipo!: ClinicalEventType;

  @IsDateString({}, { message: 'La fecha debe tener un formato ISO válido' })
  @IsNotEmpty()
  fecha!: string;

  @IsNumber({}, { message: 'El peso debe ser numérico' })
  @Min(0.1, { message: 'El peso en kg debe ser mayor a 0' })
  peso!: number;

  @IsString()
  @IsNotEmpty({ message: 'Las observaciones son obligatorias' })
  observaciones!: string;

  // --- Campos condicionales para VACUNA ---
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la vacuna es obligatorio' })
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El lote de la vacuna es obligatorio' })
  lote?: string;

  @IsOptional()
  @IsDateString()
  fechaProximaDosis?: string;

  // --- Campos condicionales para CONSULTA / CONTROL ---
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El diagnóstico es obligatorio para consultas y controles' })
  diagnostico?: string;

  @IsOptional()
  @IsDateString()
  fechaProximoControl?: string;
}