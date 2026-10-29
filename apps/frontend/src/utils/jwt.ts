/** Contenido del access token que emite auth-service (Diseño §3.1). */
export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

/**
 * Decodifica el payload del JWT. No verifica la firma: eso lo hace el API Gateway (NFR-3).
 * Devuelve null si el token está mal formado o ya venció.
 */
export function decodeToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    // El contenido va en base64url: se pasa a base64 normal y se decodifica como UTF-8.
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes));

    if (typeof payload !== 'object' || payload === null) return null;
    const { sub, email, role, exp } = payload as Record<string, unknown>;
    if (typeof exp !== 'number' || exp * 1000 <= Date.now()) return null;
    if (typeof sub !== 'string' || typeof email !== 'string' || typeof role !== 'string') return null;
    return { sub, email, role, exp };
  } catch {
    return null;
  }
}
