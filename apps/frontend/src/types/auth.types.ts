/** Roles del personal que accede al panel web*/
export type Role = "vet" | "reception" | "admin";

/** Usuario autenticado. Coincide con lo que devuelve GET /v1/auth/me. */
export interface AuthUser {
  id: string;
  name: string;
  role: Role;
}
