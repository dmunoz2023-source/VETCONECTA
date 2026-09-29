import axios from 'axios';
import { toApiError } from './errors';

/** URL base del API Gateway. Se define en apps/frontend/.env (ver .env.example). */
const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/** Clave donde el login (tarea D2) guarda el JWT. Aquí solo se lee. */
const TOKEN_STORAGE_KEY = 'jwt_token';

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    // localStorage puede no estar disponible (modo privado, permisos).
    return null;
  }
}

/** Instancia única de Axios para hablar con el API Gateway (:3000). */
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Adjunta el JWT en cada petición, si existe.
api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normaliza todos los errores al formato ApiRequestError.
// 401: solo informa (no borra el token ni redirige; eso es de AuthContext/ProtectedRoute).
// 403: informa sin cerrar sesión.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);