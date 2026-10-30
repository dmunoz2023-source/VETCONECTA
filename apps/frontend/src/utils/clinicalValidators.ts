import type { ClinicalFormValues } from '../types/clinical.types';

export function localToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function validateClinicalEvent(values: ClinicalFormValues) {
  const errors: Partial<Record<keyof ClinicalFormValues, string>> = {};
  if (!['consultation', 'vaccine', 'checkup'].includes(values.type)) errors.type = 'Selecciona un tipo de evento.';
  if (!validDate(values.date) || values.date > localToday()) errors.date = 'Ingresa una fecha válida que no sea futura.';
  if (!values.weightKg.trim() || !Number.isFinite(Number(values.weightKg)) || Number(values.weightKg) <= 0) {
    errors.weightKg = 'Ingresa un peso mayor que cero.';
  }
  if (!values.notes.trim()) errors.notes = 'Ingresa las observaciones.';
  const nextField = values.type === 'vaccine' ? 'boosterDate' : 'nextCheckup';
  if (!validDate(values[nextField]) || values[nextField] < values.date) {
    errors[nextField] = 'Ingresa una fecha válida igual o posterior al evento.';
  }
  if (values.type === 'vaccine') {
    if (!values.vaccine.trim()) errors.vaccine = 'Ingresa el nombre de la vacuna.';
    if (!values.batch.trim()) errors.batch = 'Ingresa el lote.';
  } else if (!values.diagnosis.trim()) errors.diagnosis = 'Ingresa el diagnóstico.';
  return errors;
}
