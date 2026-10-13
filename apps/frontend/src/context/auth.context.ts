import { createContext } from "react";
import type { AuthContextValue } from "../types/auth.types";

/** Sesión activa del panel. Se provee con <AuthProvider> y se consume con useAuth(). */
export const AuthContext = createContext<AuthContextValue | null>(null);
