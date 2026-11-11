import axios from 'axios';
import { getToken } from '../../utils/tokenStorage';

/** URL base del API Gateway. Se define en apps/frontend/.env (ver .env.example). */
const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/** Cliente HTTP único hacia el API Gateway (:3000). Todos los módulos de api/ lo usan. */
export const api = axios.create({ baseURL: API_URL });

/** Adjunta el JWT de la sesión activa en cada petición. */
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
