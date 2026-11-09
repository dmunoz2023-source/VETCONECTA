import Button from "../../components/common/Button";
import FormField from "../../components/common/FormField";
import TextAreaField from "../../components/common/TextAreaField/TextAreaField";
import { useClinicalEventForm } from "../../hooks/useClinicalEventForm";
import type { ClinicalEvent } from "../../types/clinical.types";
import { toDateInputValue } from "../../utils/age";
import { CLINICAL_TYPE_ICONS } from "../../utils/clinicalIcons";
import { CLINICAL_TYPE_OPTIONS, formatNextDateLabel } from "../../utils/clinicalLabels";
import css from "./ClinicalEventForm.module.css";

interface ClinicalEventFormProps {
  petId: string;
  onSaved: (event: ClinicalEvent) => void;
  onCancel: () => void;
}

interface SectionHeaderProps {
  id: string;
  step: number;
  title: string;
  subtitle: string;
}

/** Numbered heading of a form section. */
function SectionHeader({ id, step, title, subtitle }: SectionHeaderProps) {
  return (
    <header className={css.sectionHeader}>
      <span className={css.step} aria-hidden="true">
        {step}
      </span>
      <div>
        <h3 id={id} className={css.sectionTitle}>
          {title}
        </h3>
        <p className={css.sectionSubtitle}>{subtitle}</p>
      </div>
    </header>
  );
}

/** Clinical event form: the chosen type decides whether the next checkup or the next vaccine is asked for. */
export default function ClinicalEventForm({ petId, onSaved, onCancel }: ClinicalEventFormProps) {
  const { values, errors, submitting, serverError, setValue, handleSubmit } = useClinicalEventForm({
    petId,
    onSaved,
  });

  return (
    <form className={css.form} onSubmit={handleSubmit} noValidate data-type={values.type || undefined}>
      {serverError && (
        <p className={css.error} role="alert">
          {serverError}
        </p>
      )}

      <section className={css.section} aria-labelledby="clinical-step-type">
        <SectionHeader id="clinical-step-type" step={1} title="Tipo de evento" subtitle="Elige qué se realizó en la atención." />
        <div className={css.typeGrid} role="radiogroup" aria-labelledby="clinical-step-type">
          {CLINICAL_TYPE_OPTIONS.map((option) => {
            const Icon = CLINICAL_TYPE_ICONS[option.value];
            return (
              <label key={option.value} className={css.typeOption} data-type={option.value}>
                <input
                  type="radio"
                  name="clinical-event-type"
                  className={css.typeInput}
                  value={option.value}
                  checked={values.type === option.value}
                  onChange={() => setValue("type", option.value)}
                />
                <span className={css.typeCard}>
                  <Icon size={22} aria-hidden="true" />
                  <strong>{option.label}</strong>
                  <small>{option.hint}</small>
                </span>
              </label>
            );
          })}
        </div>
        {errors.type && <span className={css.fieldError}>{errors.type}</span>}
      </section>

      <section className={`${css.section} ${css.panel}`} aria-labelledby="clinical-step-data">
        <SectionHeader
          id="clinical-step-data"
          step={2}
          title="Datos de la atención"
          subtitle="Completa la fecha, el peso y lo observado en el paciente."
        />
        <div className={css.grid}>
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
        <span className={css.counter}>{values.notes.length} caracteres</span>
      </section>

      <div className={css.actions}>
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
