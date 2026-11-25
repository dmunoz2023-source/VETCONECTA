import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
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
  @IsUUID()
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
