/** URL base del API Gateway. Se define en apps/frontend/.env (ver .env.example). */
const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const LOGIN_URL = `${API_URL}/v1/auth/login`;

/** Clave donde se guarda el JWT del panel. */
const TOKEN_STORAGE_KEY = 'jwt_token';

/** Roles del sistema (BR-14). El panel clínico solo admite al personal. */
type UserRole = 'owner' | 'vet' | 'reception' | 'admin';
export type StaffRole = Exclude<UserRole, 'owner'>;

const USER_ROLES: readonly string[] = ['owner', 'vet', 'reception', 'admin'];

/** Datos de la sesión activa que necesita el panel. */
export interface Session {
  role: StaffRole;
}

const MESSAGES = {
  invalidCredentials: 'Correo o contraseña incorrectos.',
  forbidden: 'Tu cuenta no tiene permisos para ingresar.',
  notStaff: 'Esta cuenta no tiene acceso al panel clínico.',
  server: 'Ocurrió un error en el servidor. Intenta nuevamente en unos minutos.',
  network: 'No se pudo conectar con el servidor. Verifica tu conexión.',
  invalidResponse: 'El servidor respondió con datos inesperados.',
} as const;

/** Error de inicio de sesión con un mensaje listo para mostrar en pantalla. */
export class LoginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LoginError';
  }
}

function messageForStatus(status: number): string {
  if (status === 400 || status === 401) return MESSAGES.invalidCredentials;
  if (status === 403) return MESSAGES.forbidden;
  return MESSAGES.server;
}

/**
 * Lee el rol dentro del access token (diseño de microservicios, §3.1).
 * No verifica la firma: eso lo hace el API Gateway (NFR-3).
 * Devuelve null si el token está mal formado o ya venció.
 */
function readRole(token: string): UserRole | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    // El contenido va en base64url: se pasa a base64 normal y se decodifica como UTF-8.
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes));

    if (typeof payload !== 'object' || payload === null) return null;
    const { role, exp } = payload as Record<string, unknown>;
    if (typeof exp !== 'number' || exp * 1000 <= Date.now()) return null;
    if (typeof role !== 'string' || !USER_ROLES.includes(role)) return null;
    return role as UserRole;
  } catch {
    return null;
  }
}

/**
 * POST /v1/auth/login (FR-13).
 * Guarda el access token en localStorage solo si la cuenta es de personal
 * clínico, y devuelve la sesión resultante.
 */
export async function login(email: string, password: string): Promise<Session> {
  let response: Response;
  try {
    response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new LoginError(MESSAGES.network);
  }

  if (!response.ok) throw new LoginError(messageForStatus(response.status));

  const data: unknown = await response.json().catch(() => null);
  const accessToken =
    typeof data === 'object' && data !== null && 'accessToken' in data ? data.accessToken : null;
  if (typeof accessToken !== 'string') throw new LoginError(MESSAGES.invalidResponse);

  const role = readRole(accessToken);
  if (!role) throw new LoginError(MESSAGES.invalidResponse);

  // Los dueños (owner) usan la app móvil: el panel clínico no los admite (BR-14).
  if (role === 'owner') throw new LoginError(MESSAGES.notStaff);

  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
  } catch {
    // Sin localStorage (modo privado): la sesión dura solo mientras la pestaña esté abierta.
  }
  return { role };
}

/** Cierra la sesión borrando el token guardado. */
export function logout(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Nada que borrar si el almacenamiento no está disponible.
  }
}