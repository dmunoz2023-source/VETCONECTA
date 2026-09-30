// Contenido del JWT que emite auth-service (doc "Microservicios" §3.1).
// El Gateway lo mantiene local a proposito: es un proxy perimetral
// independiente y no debe acoplarse a libs/shared para arrancar.
export type UserRole = 'owner' | 'vet' | 'reception' | 'admin';

export interface JwtPayload {
  sub: string; // id del usuario en auth.users
  email: string;
  role: UserRole;
  clientId?: string; // solo si role === 'owner'
  iat?: number;
  exp?: number;
}
