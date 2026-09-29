/**
 * Utilidades para el RUT chileno.
 * Formatos aceptados como entrada: "12.345.678-5", "12345678-5", "123456785", "12.345.678-k".
 */

/** Quita puntos, guion y espacios, y deja la K en mayúscula. Ej: "12.345.678-k" → "12345678K". */
export function cleanRut(value: string): string {
  return value.replace(/[^0-9kK]/g, '').toUpperCase();
}

/**
 * Calcula el dígito verificador con el algoritmo módulo 11.
 * Recibe solo el cuerpo numérico (sin DV). Devuelve "0"-"9" o "K".
 */
export function computeRutDv(body: string): string {
  let sum = 0;
  let multiplier = 2;

  // Recorre el cuerpo de derecha a izquierda multiplicando por 2, 3, 4, 5, 6, 7, 2, 3...
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const result = 11 - (sum % 11);
  if (result === 11) return '0';
  if (result === 10) return 'K';
  return String(result);
}

/** Separa un RUT limpio en cuerpo y dígito verificador. */
function splitRut(clean: string): { body: string; dv: string } {
  return { body: clean.slice(0, -1), dv: clean.slice(-1) };
}

/**
 * Valida formato y dígito verificador.
 * El cuerpo debe tener 7 u 8 dígitos y no empezar con 0.
 */
export function isValidRut(value: string): boolean {
  const clean = cleanRut(value);
  if (!/^[1-9]\d{6,7}[0-9K]$/.test(clean)) return false;

  const { body, dv } = splitRut(clean);
  return computeRutDv(body) === dv;
}

/**
 * Formatea para mostrar en pantalla: "123456785" → "12.345.678-5".
 * Sirve también mientras el usuario escribe (formatea lo que haya).
 */
export function formatRut(value: string): string {
  const clean = cleanRut(value);
  if (clean.length <= 1) return clean;

  const { body, dv } = splitRut(clean);
  const bodyWithDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${bodyWithDots}-${dv}`;
}

/**
 * Formato que se envía al backend: sin puntos y con guion, p. ej. "12345678-5".
 * (A confirmar con backend cuando publique el DTO de clientes.)
 */
export function normalizeRut(value: string): string {
  const clean = cleanRut(value);
  if (clean.length <= 1) return clean;

  const { body, dv } = splitRut(clean);
  return `${body}-${dv}`;
}