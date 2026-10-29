const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Devuelve el mensaje de error del correo, o null si es válido. */
export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return 'Ingresa tu correo.';
  return EMAIL_PATTERN.test(email) ? null : 'Ingresa un correo válido.';
}

/** Devuelve el mensaje de error de la contraseña, o null si es válida. */
export function validatePassword(value: string): string | null {
  return value ? null : 'Ingresa tu contraseña.';
}
