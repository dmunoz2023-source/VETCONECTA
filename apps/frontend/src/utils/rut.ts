/**
 * Check digit of a Chilean RUT (módulo 11). Accepts "12.345.678-5" or "12345678-5"
 * (the same formats as CreateClientDto); the format itself is checked by the form's pattern.
 */
export function isValidRut(value: string): boolean {
  const match = /^(\d{1,2}(?:\.?\d{3}){2})-([0-9kK])$/.exec(value.trim());
  if (!match) return false;

  const digits = match[1].replace(/\./g, "").split("").reverse();
  let sum = 0;
  let factor = 2;
  for (const digit of digits) {
    sum += Number(digit) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }

  const remainder = 11 - (sum % 11);
  const expected = remainder === 11 ? "0" : remainder === 10 ? "K" : String(remainder);
  return match[2].toUpperCase() === expected;
}
