import { IsUUID, IsEnum, IsString, IsNotEmpty, IsNumber, Min, Max, IsDateString, IsOptional } from 'class-validator';

export enum ClinicalEventType {
  CONSULTA = 'consultation',
  VACUNA = 'vaccine',
  CONTROL = 'checkup',
}

export class CreateClinicalEventDto {
  @IsUUID('4', { message: 'El ID de la mascota debe ser un UUID válido' })
  @IsNotEmpty()
  mascotaId!: string;

  @IsEnum(ClinicalEventType, { message: 'El tipo debe ser consultation, vaccine o checkup' })
  @IsNotEmpty()
  tipo!: ClinicalEventType;

  @IsDateString({}, { message: 'La fecha debe tener un formato ISO válido' })
  @IsNotEmpty()
  fecha!: string;

  @IsNumber({}, { message: 'El peso debe ser numérico' })
  @IsNotEmpty()
  @Min(0.1, { message: 'El peso en kg debe ser mayor a 0' })
  peso?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La temperatura debe ser numérica' })
  @Min(30, { message: 'La temperatura no es válida' })
  @Max(45, { message: 'La temperatura no es válida' })
  temperatura?: number;

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsString()
  @IsNotEmpty({ message: 'Las observaciones son obligatorias' })
  observaciones!: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de próximo control debe ser un formato válido' })
  proximoControl?: string;
}