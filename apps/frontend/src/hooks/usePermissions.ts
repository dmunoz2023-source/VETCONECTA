import { useCallback } from "react";
import { can, type Permission } from "../utils/permissions";
import { useAuth } from "./useAuth";

/** Returns `can(permission)` for the active session's role (to hide buttons by role). */
export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;
  return useCallback((permission: Permission) => can(role, permission), [role]);
}
