import axios from 'axios';
import { clearToken, getToken } from '../utils/tokenStorage';

/** URL base del API Gateway. Se define en apps/frontend/.env (ver .env.example). */
const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/** Cliente HTTP único hacia el API Gateway (:3000). */
export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // 401 con sesión activa: el token venció, se vuelve al login.
    // Sin sesión (credenciales incorrectas en el login) el error lo muestra la pantalla.
    if (axios.isAxiosError(error) && error.response?.status === 401 && getToken()) {
      clearToken();
      window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);

/**
 * Mensaje legible del formato de error común (`message`), o `fallback` si no viene.
 * Los 400 de class-validator traen `message` como lista: se unen en un solo texto.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) return message;
    if (Array.isArray(message)) {
      const parts = message.filter((part): part is string => typeof part === 'string' && part.trim() !== '');
      if (parts.length) return parts.join(' ');
    }
  }
  return fallback;
}
