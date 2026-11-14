import type { Role } from "../types/auth.types";

/**
 * Panel actions by role (BR-14 and the endpoint table of clients-pets-service).
 * Buttons are hidden in the UI; the API still answers 403 if attempted.
 */
const PERMISSIONS = {
  /** POST /v1/pets */
  createPet: ["reception", "admin"],
  /** PATCH /v1/pets/{id} */
  editPet: ["reception", "admin", "vet"],
  /** DELETE /v1/pets/{id} (soft delete) */
  deactivatePet: ["admin"],
  /** GET /v1/clinical/pets/{id}/carnet: F2 only allows owner, vet and reception (the admin gets 403). */
  viewClinicalHistory: ["vet", "reception"],
  /** POST /v1/clinical/events (I2) */
  registerClinicalEvent: ["vet"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

/** Roles that have the permission (to protect routes with <ProtectedRoute allowedRoles>). */
export function rolesFor(permission: Permission): readonly Role[] {
  return PERMISSIONS[permission];
}

export function can(role: Role | undefined, permission: Permission): boolean {
  return role !== undefined && (PERMISSIONS[permission] as readonly Role[]).includes(role);
}
