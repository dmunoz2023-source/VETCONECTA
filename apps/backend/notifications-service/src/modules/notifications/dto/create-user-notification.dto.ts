import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  Matches,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateUserNotificationDto {
  @ApiProperty({
    format: 'uuid',
    description: 'Usuario destinatario del aviso.',
  })
  // PostgreSQL accepts UUIDs with non-RFC version or variant bits.
  @Matches(/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i)
  userId!: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Mascota asociada al aviso.',
  })
  @IsOptional()
  @IsUUID()
  petId?: string;

  @ApiProperty({ maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body!: string;
}
