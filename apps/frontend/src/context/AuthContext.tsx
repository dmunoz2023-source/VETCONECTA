import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getSessionUser, login as loginRequest } from "../api/auth.api";
import type { AuthContextValue, AuthUser, LoginCredentials } from "../types/auth.types";
import { clearToken, getToken, setToken } from "../utils/tokenStorage";
import { AuthContext } from "./auth.context";

/** Recupera la sesión guardada al recargar; descarta el token si venció o no es válido. */
function readStoredUser(): AuthUser | null {
  const token = getToken();
  if (!token) return null;

  const user = getSessionUser(token);
  if (!user) clearToken();
  return user;
}

/** Mantiene la sesión activa (token en almacenamiento y usuario) para toda la aplicación. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const session = await loginRequest(credentials);
    setToken(session.token);
    setUser(session.user);
    return session.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
