import {
  clinicTimeToDate,
  dayOfWeek,
  formatClinicDateTime,
  fromMinutes,
  nextDate,
  toMinutes,
} from './clinic-time';

describe('clinic-time', () => {
  it('convierte hora local en horario de verano (UTC-3)', () => {
    expect(clinicTimeToDate('2026-11-09', '09:00').toISOString()).toBe('2026-11-09T12:00:00.000Z');
  });

  it('convierte hora local en horario de invierno (UTC-4)', () => {
    expect(clinicTimeToDate('2026-07-06', '09:00').toISOString()).toBe('2026-07-06T13:00:00.000Z');
  });

  it('formatea con el desfase vigente en cada época del año', () => {
    expect(formatClinicDateTime(new Date('2026-11-09T12:00:00Z'))).toBe('2026-11-09T09:00:00-03:00');
    expect(formatClinicDateTime(new Date('2026-07-06T13:00:00Z'))).toBe('2026-07-06T09:00:00-04:00');
  });

  it('calcula el día de la semana sin depender de la zona del servidor', () => {
    expect(dayOfWeek('2026-11-08')).toBe(0);
    expect(dayOfWeek('2026-11-09')).toBe(1);
  });

  it('avanza al día siguiente cruzando fin de mes', () => {
    expect(nextDate('2026-12-31')).toBe('2027-01-01');
  });

  it('convierte entre hora y minutos', () => {
    expect(toMinutes('09:30')).toBe(570);
    expect(fromMinutes(570)).toBe('09:30');
  });
});
