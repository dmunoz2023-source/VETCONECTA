import type { AuthUser } from "../types/auth.types";
import { AUTH_USER_MOCK } from "../mocks/auth.mock";

interface AuthSession {
  /** Usuario de la sesión activa; `null` si no hay sesión. */
  user: AuthUser | null;
  /** `true` cuando existe una sesión válida. */
  isAuthenticated: boolean;
}

/** Hook que devuelve la sesión activa (usuario y estado de autenticación).
 * Hoy devuelve una sesión simulada (`AUTH_USER_MOCK`).
 * TODO (auth real): cuando exista el AuthContext (tarea de autenticación),
 * reemplazar el cuerpo por `useContext(AuthContext)` sin cambiar lo que
 * devuelve; así Header y ProtectedRoute no requieren modificaciones.
 */
export function useAuth(): AuthSession {
  return { user: AUTH_USER_MOCK, isAuthenticated: true };
}
