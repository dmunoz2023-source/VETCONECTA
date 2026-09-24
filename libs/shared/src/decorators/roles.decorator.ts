import { SetMetadata } from '@nestjs/common';
import { JwtPayload } from '../types/jwt-payload.interface';

export const ROLES_KEY = 'roles';

// Marca qué roles pueden entrar a una ruta. Por sí solo no valida nada,
// lo lee RolesGuard. Ejemplo: @Roles('vet', 'admin')
export const Roles = (...roles: JwtPayload['role'][]) => SetMetadata(ROLES_KEY, roles);
