import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateSpecialtyDto {
  @ApiProperty({ example: 'Dermatología' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 30, minimum: 5, maximum: 480, description: 'Duración del bloque en minutos.' })
  @IsInt()
  @Min(5)
  @Max(480)
  durationMinutes: number;
}
