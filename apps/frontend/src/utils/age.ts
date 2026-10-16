/** Convierte "AAAA-MM-DD" en una fecha local (evita el desfase de un día que produce `new Date("AAAA-MM-DD")`, que la toma en UTC). */
export function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);
  return date.getMonth() === month - 1 ? date : null;
}

/**
 * Edad legible a partir de la fecha de nacimiento, con la misma regla que
 * clients-pets-service (age-calculator.util). Se usa como vista previa en el
 * formulario; en la ficha se muestra la edad que entrega la API (BR-2).
 */
export function formatAge(birthDate: string, today: Date = new Date()): string | null {
  const birth = parseDateOnly(birthDate);
  if (!birth || birth > today) return null;

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  if (today.getDate() < birth.getDate()) months--;
  if (months < 0) {
    years--;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} año${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} mes${months > 1 ? "es" : ""}`);
  return parts.length ? parts.join(" y ") : "Menos de un mes";
}
