import { useCallback } from "react";
import { can, type Permission } from "../utils/permissions";
import { useAuth } from "./useAuth";

/** Devuelve `can(permiso)` para el rol de la sesión activa (para ocultar botones según el rol). */
export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;
  return useCallback((permission: Permission) => can(role, permission), [role]);
}
