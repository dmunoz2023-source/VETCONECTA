import { ApiProperty } from '@nestjs/swagger';

// Esquema de documentacion del dominio catalog (proxied a :3006).
// GET /v1/catalog/clinic es publico (boton de panico de la app movil).

export class ClinicDto {
  @ApiProperty({ example: 'Clinica VetConecta' })
  name: string;

  @ApiProperty({ example: '+56912345678', description: 'Telefono de emergencia (FR-10, BR-11)' })
  emergencyPhone: string;

  @ApiProperty({ example: 'emergencia@vetconecta.cl' })
  email: string;
}
