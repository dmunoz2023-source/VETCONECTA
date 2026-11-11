/** Texto de un campo opcional del formulario: recortado, o null si quedó vacío (así lo espera el backend). */
export function blankToNull(value: string): string | null {
  return value.trim() || null;
}
