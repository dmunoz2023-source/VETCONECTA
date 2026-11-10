import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsPositive,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ClinicalEventType {
  CONSULTA = 'consultation',
  VACUNA = 'vaccine',
  CONTROL = 'checkup',
}

export class CreateClinicalEventDto {
  @ApiProperty({ description: 'UUID de la mascota', format: 'uuid' })
  @IsUUID('4', { message: 'El ID de la mascota debe ser un UUID válido' })
  @IsNotEmpty()
  mascotaId!: string;

  @ApiProperty({ enum: ClinicalEventType, description: 'Tipo de evento clínico' })
  @IsEnum(ClinicalEventType, {
    message: 'El tipo debe ser consultation, vaccine o checkup',
  })
  @IsNotEmpty()
  tipo!: ClinicalEventType;

  @ApiProperty({ description: 'Fecha del evento; no puede ser futura', format: 'date-time' })
  @IsDateString({}, { message: 'La fecha debe tener un formato ISO válido' })
  @IsNotEmpty()
  fecha!: string;

  @ApiProperty({ description: 'Peso de la mascota en kg; debe ser mayor a cero', minimum: 0 })
  @IsNumber({}, { message: 'El peso debe ser numérico' })
  @IsPositive({ message: 'El peso en kg debe ser mayor a 0' })
  peso!: number;

  @ApiPropertyOptional({ description: 'Temperatura en °C, entre 30 y 45', minimum: 30, maximum: 45 })
  @IsOptional()
  @IsNumber({}, { message: 'La temperatura debe ser numérica' })
  @Min(30, { message: 'La temperatura no es válida' })
  @Max(45, { message: 'La temperatura no es válida' })
  temperatura?: number;

  @ApiPropertyOptional({ description: 'Motivo de la consulta', maxLength: 200 })
  @IsOptional()
  @ApiProperty({ description: 'Observaciones clínicas' })
  @IsString()
  @MaxLength(200)
  motivo?: string;

  @IsString()
  @IsNotEmpty({ message: 'Las observaciones son obligatorias' })
  observaciones!: string;

  @ApiPropertyOptional({ description: 'Obligatorio solo para eventos vaccine', maxLength: 100 })
  @ValidateIf((dto: CreateClinicalEventDto) => dto.tipo === ClinicalEventType.VACUNA)
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la vacuna es obligatorio' })
  @MaxLength(100)
  nombreVacuna?: string;

  @ApiPropertyOptional({ description: 'Lote; obligatorio solo para eventos vaccine', maxLength: 50 })
  @ValidateIf((dto: CreateClinicalEventDto) => dto.tipo === ClinicalEventType.VACUNA)
  @IsString()
  @IsNotEmpty({ message: 'El lote de la vacuna es obligatorio' })
  @MaxLength(50)
  lote?: string;

  @ApiPropertyOptional({ description: 'Fecha de próxima dosis; obligatoria solo para eventos vaccine', format: 'date' })
  @ValidateIf((dto: CreateClinicalEventDto) => dto.tipo === ClinicalEventType.VACUNA)
  @IsDateString(
    {},
    { message: 'La fecha de próxima dosis debe tener un formato ISO válido' },
  )
  fechaProximaDosis?: string;

  @ApiPropertyOptional({ description: 'Obligatorio para consultation y checkup', maxLength: 200 })
  @ValidateIf(
    (dto: CreateClinicalEventDto) => dto.tipo !== ClinicalEventType.VACUNA,
  )
  @IsString()
  @IsNotEmpty({ message: 'El diagnóstico es obligatorio' })
  @MaxLength(200)
  diagnostico?: string;

  @ApiPropertyOptional({ description: 'Fecha de próximo control; obligatoria para consultation y checkup', format: 'date' })
  @ValidateIf(
    (dto: CreateClinicalEventDto) => dto.tipo !== ClinicalEventType.VACUNA,
  )
  @IsDateString(
    {},
    { message: 'La fecha de próximo control debe tener un formato ISO válido' },
  )
  proximoControl?: string;
}

// PUT reemplaza los datos del evento y requiere el mismo conjunto que la creación.
export class UpdateClinicalEventDto extends CreateClinicalEventDto {}
