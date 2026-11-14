import axios from 'axios';
import { clearToken, getToken } from '../../utils/tokenStorage';
import { getErrorMessage, getErrorStatus } from './errors';
import { emitForbidden, emitUnauthorized } from './sessionEvents';

/** URL base del API Gateway. Se define en apps/frontend/.env (ver .env.example). */
const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const FORBIDDEN_MESSAGE = 'No tienes permisos para realizar esta acción.';

/** Cliente HTTP único hacia el API Gateway (:3000). Todos los módulos de api/ lo usan. */
export const api = axios.create({ baseURL: API_URL });

/** Adjunta el JWT de la sesión activa en cada petición. */
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Manejo global de 401 y 403 (Panel web §3). El error se sigue propagando
 * para que cada pantalla salga de su estado de carga.
 * - 401 con sesión (token enviado): el token venció → se borra y la app vuelve a /login.
 *   Un 401 sin token (credenciales incorrectas en el login) lo maneja auth.api.
 * - 403: el rol no tiene permiso → alerta visual, la sesión sigue activa.
 */
api.interceptors.response.use(undefined, (error: unknown) => {
  const status = getErrorStatus(error);
  const sentToken = axios.isAxiosError(error) && Boolean(error.config?.headers?.Authorization);

  if (status === 401 && sentToken) {
    clearToken();
    emitUnauthorized();
  } else if (status === 403) {
    emitForbidden(getErrorMessage(error, FORBIDDEN_MESSAGE));
  }

  return Promise.reject(error);
});
