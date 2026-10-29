/** Clave donde se guarda el JWT del panel. */
const TOKEN_STORAGE_KEY = 'jwt_token';

// Sin localStorage (modo privado) la sesión dura solo mientras la pestaña esté abierta.

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Se ignora: la sesión queda solo en memoria.
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Se ignora: no hay nada que limpiar.
  }
}
