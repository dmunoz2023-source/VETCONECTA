// Rutas publicas exentas de validacion de JWT. Todo lo que no este aqui
// exige un Bearer valido antes de reenviarse al microservicio destino.

export interface PublicRoute {
  method: string;
  path: string;
}

// Coincidencia exacta metodo + path.
export const PUBLIC_ROUTES: PublicRoute[] = [
  { method: 'POST', path: '/v1/auth/login' },
  { method: 'POST', path: '/v1/auth/register' },
  { method: 'GET', path: '/v1/catalog/clinic' },
];

// Prefijos publicos (Swagger UI y el JSON del contrato): cualquier ruta que empiece asi.
export const PUBLIC_PATH_PREFIXES = ['/docs', '/docs-json'];

// Normaliza el path: quita query string y una eventual barra final.
function normalizePath(url: string): string {
  const path = url.split('?')[0];
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }
  return path;
}

export function isPublicRoute(method: string, url: string): boolean {
  const path = normalizePath(url);
  const upperMethod = method.toUpperCase();

  if (PUBLIC_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return true;
  }

  return PUBLIC_ROUTES.some(
    (route) => route.method === upperMethod && route.path === path,
  );
}
