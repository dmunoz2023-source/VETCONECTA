import type { Role } from "../types/auth.types";

/**
 * Acciones del panel según el rol (BR-14 y tabla de endpoints de clients-pets-service).
 * Los botones se ocultan en la interfaz; la API igual responde 403 si se intenta.
 */
const PERMISSIONS = {
  /** POST /v1/pets */
  createPet: ["reception", "admin"],
  /** PATCH /v1/pets/{id} */
  editPet: ["reception", "admin", "vet"],
  /** DELETE /v1/pets/{id} (baja lógica) */
  deactivatePet: ["admin"],
  /** GET /v1/clinical/pets/{id}/carnet: F2 only allows owner, vet and reception (the admin gets 403). */
  viewClinicalHistory: ["vet", "reception"],
  /** POST /v1/clinical/events (I2) */
  registerClinicalEvent: ["vet"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

/** Roles que tienen el permiso (para proteger rutas con <ProtectedRoute allowedRoles>). */
export function rolesFor(permission: Permission): readonly Role[] {
  return PERMISSIONS[permission];
}

export function can(role: Role | undefined, permission: Permission): boolean {
  return role !== undefined && (PERMISSIONS[permission] as readonly Role[]).includes(role);
}
