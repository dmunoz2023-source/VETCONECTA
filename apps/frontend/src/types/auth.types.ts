/** Roles del personal que accede al panel web (BR-14). Los dueños (owner) usan la app móvil. */
export type Role = "vet" | "reception" | "admin";

export const STAFF_ROLES: readonly Role[] = ["vet", "reception", "admin"];

/** Usuario autenticado, tomado del access token (sub, email, role). */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

/** Cuerpo de POST /v1/auth/login: `identifier` acepta RUT o correo. */
export interface LoginCredentials {
  identifier: string;
  password: string;
}

/** Valor que expone el AuthContext a toda la aplicación. */
export interface AuthContextValue {
  /** Usuario de la sesión activa; `null` si no hay sesión. */
  user: AuthUser | null;
  /** `true` cuando existe una sesión válida. */
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => void;
}
