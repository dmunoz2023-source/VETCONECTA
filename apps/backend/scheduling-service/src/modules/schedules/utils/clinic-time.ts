/** Zona horaria de la clínica: horarios y bloqueos se guardan en hora local. */
export const CLINIC_TIME_ZONE = 'America/Santiago';

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: CLINIC_TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
});

/** Diferencia entre la hora de la clínica y UTC en ese instante (cambia con el horario de verano). */
function clinicOffsetMs(instant: number): number {
  const parts = Object.fromEntries(
    formatter.formatToParts(instant).map(({ type, value }) => [type, Number(value)]),
  );
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUtc - Math.floor(instant / 1000) * 1000;
}

/** Convierte una fecha 'YYYY-MM-DD' y hora 'HH:mm' locales de la clínica en un instante real. */
export function clinicTimeToDate(date: string, time: string): Date {
  const wallClock = Date.parse(`${date}T${time}:00Z`);
  const firstGuess = wallClock - clinicOffsetMs(wallClock);
  return new Date(wallClock - clinicOffsetMs(firstGuess));
}

/** Día de la semana de una fecha 'YYYY-MM-DD': 0 = domingo ... 6 = sábado. */
export function dayOfWeek(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

/** Fecha 'YYYY-MM-DD' del día siguiente. */
export function nextDate(date: string): string {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

/** Minutos desde medianoche de una hora 'HH:mm'. */
export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Hora 'HH:mm' a partir de minutos desde medianoche. */
export function fromMinutes(total: number): string {
  const hours = String(Math.floor(total / 60)).padStart(2, '0');
  const minutes = String(total % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}
