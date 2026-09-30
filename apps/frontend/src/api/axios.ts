import axios from 'axios';

/** URL base del API Gateway. Se define en apps/frontend/.env (ver .env.example). */
const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/** Clave donde el login guarda el JWT del panel. */
const TOKEN_STORAGE_KEY = 'jwt_token';

/** Cliente HTTP único hacia el API Gateway (:3000). */
export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // 401: token ausente o vencido, se vuelve al login.
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);

/** Mensaje legible del formato de error común (`message`), o `fallback` si no viene. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}