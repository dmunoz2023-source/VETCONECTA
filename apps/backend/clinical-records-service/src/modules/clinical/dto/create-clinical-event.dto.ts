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

export enum ClinicalEventType {
  CONSULTA = 'consultation',
  VACUNA = 'vaccine',
  CONTROL = 'checkup',
}

export class CreateClinicalEventDto {
  @IsUUID('4', { message: 'El ID de la mascota debe ser un UUID válido' })
  @IsNotEmpty()
  mascotaId!: string;

  @IsEnum(ClinicalEventType, {
    message: 'El tipo debe ser consultation, vaccine o checkup',
  })
  @IsNotEmpty()
  tipo!: ClinicalEventType;

  @IsDateString({}, { message: 'La fecha debe tener un formato ISO válido' })
  @IsNotEmpty()
  fecha!: string;

  @IsNumber({}, { message: 'El peso debe ser numérico' })
  @IsPositive({ message: 'El peso en kg debe ser mayor a 0' })
  peso!: number;

  @IsOptional()
  @IsNumber({}, { message: 'La temperatura debe ser numérica' })
  @Min(30, { message: 'La temperatura no es válida' })
  @Max(45, { message: 'La temperatura no es válida' })
  temperatura?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  motivo?: string;

  @IsString()
  @IsNotEmpty({ message: 'Las observaciones son obligatorias' })
  observaciones!: string;

  @ValidateIf((dto: CreateClinicalEventDto) => dto.tipo === ClinicalEventType.VACUNA)
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la vacuna es obligatorio' })
  @MaxLength(100)
  nombreVacuna?: string;

  @ValidateIf((dto: CreateClinicalEventDto) => dto.tipo === ClinicalEventType.VACUNA)
  @IsString()
  @IsNotEmpty({ message: 'El lote de la vacuna es obligatorio' })
  @MaxLength(50)
  lote?: string;

  @ValidateIf((dto: CreateClinicalEventDto) => dto.tipo === ClinicalEventType.VACUNA)
  @IsDateString(
    {},
    { message: 'La fecha de próxima dosis debe tener un formato ISO válido' },
  )
  fechaProximaDosis?: string;

  @ValidateIf(
    (dto: CreateClinicalEventDto) => dto.tipo !== ClinicalEventType.VACUNA,
  )
  @IsString()
  @IsNotEmpty({ message: 'El diagnóstico es obligatorio' })
  @MaxLength(200)
  diagnostico?: string;

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
