import axios from 'axios';
import { api, getErrorMessage } from './axios';
import { STAFF_ROLES } from '../types/auth.types';
import type { AuthUser, LoginCredentials, Role } from '../types/auth.types';
import { decodeToken } from '../utils/jwt';

/** Respuesta de POST /v1/auth/login: datos del usuario más el access token. */
interface LoginResponse {
  accessToken: string;
}

/** Resultado de un login correcto: token a persistir y usuario de la sesión. */
export interface LoginResult {
  token: string;
  user: AuthUser;
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

function toLoginError(error: unknown): LoginError {
  if (!axios.isAxiosError(error) || !error.response) return new LoginError(MESSAGES.network);
  return new LoginError(getErrorMessage(error, messageForStatus(error.response.status)));
}

function isStaffRole(role: string): role is Role {
  return (STAFF_ROLES as readonly string[]).includes(role);
}

/**
 * Usuario de la sesión a partir del access token. Devuelve null si el token
 * no es válido, venció o pertenece a un dueño (owner), que usa la app móvil (BR-14).
 */
export function getSessionUser(token: string): AuthUser | null {
  const payload = decodeToken(token);
  if (!payload || !isStaffRole(payload.role)) return null;
  return { id: payload.sub, email: payload.email, role: payload.role };
}

/** POST /v1/auth/login (FR-13). Solo admite cuentas del personal clínico. */
export async function login({ identifier, password }: LoginCredentials): Promise<LoginResult> {
  let data: LoginResponse;
  try {
    ({ data } = await api.post<LoginResponse>('/v1/auth/login', {
      identifier: identifier.trim(),
      password,
    }));
  } catch (error: unknown) {
    throw toLoginError(error);
  }

  const token = data?.accessToken;
  if (typeof token !== 'string') throw new LoginError(MESSAGES.invalidResponse);

  const payload = decodeToken(token);
  if (!payload) throw new LoginError(MESSAGES.invalidResponse);

  const user = getSessionUser(token);
  if (!user) throw new LoginError(MESSAGES.notStaff);
  return { token, user };
}
