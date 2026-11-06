import Button from "../../components/common/Button";
import FormField from "../../components/common/FormField";
import SelectField from "../../components/common/SelectField";
import TextAreaField from "../../components/common/TextAreaField";
import { useClinicalEventForm } from "../../hooks/useClinicalEventForm";
import type { ClinicalEvent } from "../../types/clinical.types";
import { toDateInputValue } from "../../utils/age";
import { CLINICAL_TYPE_OPTIONS, formatNextDateLabel } from "../../utils/clinicalLabels";

interface ClinicalEventFormProps {
  petId: string;
  onSaved: (event: ClinicalEvent) => void;
  onCancel: () => void;
}

/** Formulario de evento clínico: el tipo decide si se pide el próximo control o la próxima vacuna. */
export default function ClinicalEventForm({ petId, onSaved, onCancel }: ClinicalEventFormProps) {
  const { values, errors, submitting, serverError, setValue, handleSubmit } = useClinicalEventForm({
    petId,
    onSaved,
  });

  return (
    <form className="vc-pet-form" onSubmit={handleSubmit} noValidate>
      {serverError && (
        <p className="vc-modal-error" role="alert">
          {serverError}
        </p>
      )}

      <div className="vc-form-grid">
        <SelectField
          label="Tipo de evento"
          options={CLINICAL_TYPE_OPTIONS}
          value={values.type}
          onChange={(e) => setValue("type", e.target.value)}
          error={errors.type}
        />
        <FormField
          label="Fecha"
          type="date"
          max={toDateInputValue(new Date())}
          value={values.date}
          onChange={(e) => setValue("date", e.target.value)}
          error={errors.date}
        />
        <FormField
          label="Peso (kg)"
          type="number"
          min="0.1"
          step="0.1"
          inputMode="decimal"
          value={values.weightKg}
          onChange={(e) => setValue("weightKg", e.target.value)}
          placeholder="8.5"
          error={errors.weightKg}
        />
        <FormField
          label={`${formatNextDateLabel(values.type)} (opcional)`}
          type="date"
          min={values.date}
          value={values.nextCheckup}
          onChange={(e) => setValue("nextCheckup", e.target.value)}
          error={errors.nextCheckup}
        />
      </div>

      <TextAreaField
        label="Observaciones"
        value={values.notes}
        onChange={(e) => setValue("notes", e.target.value)}
        placeholder="Paciente estable, sin hallazgos."
        error={errors.notes}
      />

      <div className="vc-modal-actions">
        <Button type="button" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Guardando..." : "Registrar evento"}
        </Button>
      </div>
    </form>
  );
}
