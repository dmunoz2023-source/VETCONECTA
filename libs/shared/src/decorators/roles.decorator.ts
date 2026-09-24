import { SetMetadata } from '@nestjs/common';
import { JwtPayload } from '../types/jwt-payload.interface';

export const ROLES_KEY = 'roles';

// Define los roles autorizados para una ruta. Se lee en RolesGuard.
// Uso: @Roles('vet', 'admin')
export const Roles = (...roles: JwtPayload['role'][]) => SetMetadata(ROLES_KEY, roles);
