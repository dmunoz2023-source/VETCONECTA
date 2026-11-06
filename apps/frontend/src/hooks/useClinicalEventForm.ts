import { useState } from "react";
import type { FormEvent } from "react";
import { getErrorMessage } from "../api/axios";
import { createClinicalEvent } from "../api/clinical.api";
import type { ClinicalEvent, ClinicalEventFormValues } from "../types/clinical.types";
import { toDateInputValue } from "../utils/age";
import { validateClinicalEventForm } from "../utils/clinicalValidators";

interface UseClinicalEventFormOptions {
  petId: string;
  onSaved: (event: ClinicalEvent) => void;
}

/** Formulario vacío con la fecha de hoy por defecto. */
const emptyValues = (): ClinicalEventFormValues => ({
  type: "",
  date: toDateInputValue(new Date()),
  weightKg: "",
  notes: "",
  nextCheckup: "",
});

/**
 * Estado y envío del formulario de evento clínico (UC-06). Valida con las mismas
 * reglas del backend antes de enviar; los errores aparecen tras el primer intento
 * de guardar. Si la API responde con error (400, 403, 404), el mensaje queda en
 * `serverError` y los datos ingresados se conservan.
 */
export function useClinicalEventForm({ petId, onSaved }: UseClinicalEventFormOptions) {
  const [values, setValues] = useState(emptyValues);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const errors = submitted ? validateClinicalEventForm(values) : {};

  const setValue = (field: keyof ClinicalEventFormValues, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(validateClinicalEventForm(values)).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      onSaved(await createClinicalEvent(petId, values));
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, "No se pudo registrar el evento clínico."));
      setSubmitting(false);
    }
  };

  return { values, errors, submitting, serverError, setValue, handleSubmit };
}
