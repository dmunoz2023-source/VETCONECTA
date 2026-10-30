import { useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClinicalEvent, clinicalErrorMessage } from '../../api/clinical.api';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import SelectField from '../../components/common/SelectField';
import { clinicalTypes, type ClinicalFormValues } from '../../types/clinical.types';
import { localToday, validateClinicalEvent } from '../../utils/clinicalValidators';

export default function ClinicalEventForm({ petId }: { petId: string }) {
  const navigate = useNavigate();
  const submitting = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ClinicalFormValues, string>>>({});
  const [values, setValues] = useState<ClinicalFormValues>({
    type: 'consultation', date: localToday(), weightKg: '', notes: '', diagnosis: '',
    nextCheckup: '', vaccine: '', batch: '', boosterDate: '',
  });
  const change = (field: keyof ClinicalFormValues, value: string) => {
    setValues(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: undefined }));
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current) return;
    const validation = validateClinicalEvent(values);
    setErrors(validation);
    setError(null);
    if (Object.keys(validation).length) return;
    submitting.current = true;
    setSaving(true);
    try {
      await createClinicalEvent(petId, values);
      navigate(`/mascotas/${petId}/historial`, { replace: true, state: { notice: 'Evento clínico registrado.' } });
    } catch (err: unknown) {
      setError(clinicalErrorMessage(err));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };
  const field = (name: keyof ClinicalFormValues, label: string, type = 'text') => (
    <FormField label={label} type={type} value={values[name]} required
      error={errors[name]} onChange={event => change(name, event.target.value)} />
  );
  return (
    <form className="vc-pet-form" onSubmit={submit} noValidate>
      {error && <p role="alert" className="vc-modal-error">{error}</p>}
      {Object.keys(errors).some(key => errors[key as keyof ClinicalFormValues]) && (
        <p role="alert" className="vc-field-error">Revisa los campos indicados antes de guardar.</p>
      )}
      <fieldset disabled={saving} className="vc-clinical-fields">
        <legend>Datos del evento (todos los campos son obligatorios)</legend>
        <div className="vc-form-grid">
          <SelectField label="Tipo de evento" options={[...clinicalTypes]} required value={values.type}
            error={errors.type} onChange={event => change('type', event.target.value)} />
          <FormField label="Fecha" type="date" required max={localToday()} value={values.date}
            error={errors.date} onChange={event => change('date', event.target.value)} />
          <FormField label="Peso (kg)" type="number" min="0.01" step="0.01" required value={values.weightKg}
            error={errors.weightKg} onChange={event => change('weightKg', event.target.value)} />
          {values.type === 'vaccine' ? <>
            {field('vaccine', 'Nombre de la vacuna')}
            {field('batch', 'Lote')}
            {field('boosterDate', 'Próxima vacuna', 'date')}
          </> : <>
            {field('diagnosis', 'Diagnóstico')}
            {field('nextCheckup', 'Próximo control', 'date')}
          </>}
        </div>
        <label className="vc-field">
          Observaciones
          <textarea rows={4} required value={values.notes} aria-invalid={!!errors.notes}
            onChange={event => change('notes', event.target.value)} />
          {errors.notes && <span className="vc-field-error">{errors.notes}</span>}
        </label>
      </fieldset>
      <div className="vc-clinical-actions">
        <Button type="button" disabled={saving} onClick={() => navigate(`/mascotas/${petId}`)}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar evento'}</Button>
      </div>
    </form>
  );
}
