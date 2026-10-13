import { useContext } from "react";
import { AuthContext } from "../context/auth.context";
import type { AuthContextValue } from "../types/auth.types";

/** Acceso a la sesión activa (usuario, login y logout). Debe usarse dentro de <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  return context;
}
