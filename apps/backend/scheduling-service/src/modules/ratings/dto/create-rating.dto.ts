import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export const MAX_COMMENT_LENGTH = 500;

/** [K2] Cuerpo de POST /v1/scheduling/appointments/:id/rating. */
export class CreateRatingDto {
  @ApiProperty({ minimum: 1, maximum: 5, example: 5, description: 'Estrellas de 1 a 5.' })
  @IsInt({ message: 'stars debe ser un número entero' })
  @Min(1, { message: 'stars debe ser como mínimo 1' })
  @Max(5, { message: 'stars debe ser como máximo 5' })
  stars!: number;

  @ApiPropertyOptional({
    maxLength: MAX_COMMENT_LENGTH,
    example: 'Muy buena atención.',
    description: 'Comentario opcional (máximo 500 caracteres). Un comentario en blanco se ignora.',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  })
  @IsString()
  @MaxLength(MAX_COMMENT_LENGTH, {
    message: `comment debe tener como máximo ${MAX_COMMENT_LENGTH} caracteres`,
  })
  comment?: string;
}
