export function calculateAge(birthDate: string | Date | null): { years: number; months: number; displayAge: string } | null {
  if (!birthDate) {
    return null; // Si no hay fecha de nacimiento, devuelve null
  }

  const today = new Date();
  const birth = new Date(birthDate);

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (today.getDate() < birth.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  let displayAge = '';
  if (years > 0) {
    displayAge += `${years} año${years > 1 ? 's' : ''}`;
  }
  if (months > 0) {
    if (displayAge) displayAge += ' y ';
    displayAge += `${months} mes${months > 1 ? 'es' : ''}`;
  }
  if (!displayAge) {
    displayAge = 'Menos de un mes';
  }

  return { years, months, displayAge };
}