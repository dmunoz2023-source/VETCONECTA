import { ApiProperty } from '@nestjs/swagger';

// Esquemas de documentacion del dominio auth (proxied a :3001).
// Solo describen el contrato para que Mobile/Web generen clientes tipados;
// no tienen logica ni crean rutas reales en el Gateway.

export class LoginRequestDto {
  @ApiProperty({ example: 'dueno1@vetconecta.cl', description: 'Correo del usuario' })
  email: string;

  @ApiProperty({ example: 'Secreta123!', description: 'Contrasena en texto plano' })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT firmado (expira en 15 min)' })
  accessToken: string;

  @ApiProperty({ enum: ['owner', 'vet', 'reception', 'admin'], example: 'owner' })
  role: string;
}

export class RegisterRequestDto {
  @ApiProperty({ example: 'nuevo@vetconecta.cl' })
  email: string;

  @ApiProperty({ example: 'Secreta123!' })
  password: string;

  @ApiProperty({ enum: ['owner', 'vet', 'reception', 'admin'], example: 'owner' })
  role: string;
}
