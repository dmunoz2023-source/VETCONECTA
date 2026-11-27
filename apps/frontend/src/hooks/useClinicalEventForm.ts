import { useState } from "react";
import type { FormEvent } from "react";
import { getErrorMessage } from "../api/axios";
import { createClinicalEvent } from "../api/clinical.api";
import type { ClinicalEvent, ClinicalEventFormValues } from "../types/clinical.types";
import { toDateInputValue } from "../utils/age";
import { CLINICAL_FORM_STEPS, validateClinicalEventForm } from "../utils/clinicalValidators";
import type { ClinicalEventFormErrors } from "../utils/clinicalValidators";

interface UseClinicalEventFormOptions {
  petId: string;
  onSaved: (event: ClinicalEvent) => void;
}

/** Empty form with today's date by default. */
const emptyValues = (): ClinicalEventFormValues => ({
  type: "",
  date: toDateInputValue(new Date()),
  weightKg: "",
  notes: "",
  diagnosis: "",
  nextCheckup: "",
  vaccineName: "",
  batch: "",
});

/**
 * State and submission of the clinical event form (UC-06), filled in two steps (type, data).
 * Validates with the same rules as the backend: the type is checked before moving on and
 * the whole form again before sending. A field shows its error only after the user tried
 * to leave its step, and it updates while they fix it. If the API answers with an error (400, 403, 404) the message goes to
 * `serverError` and the entered data is kept.
 */
export function useClinicalEventForm({ petId, onSaved }: UseClinicalEventFormOptions) {
  const [values, setValues] = useState(emptyValues);
  const [step, setStep] = useState(1);
  const [attempted, setAttempted] = useState<(keyof ClinicalEventFormValues)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const allErrors = validateClinicalEventForm(values);
  const errors: ClinicalEventFormErrors = {};
  for (const field of attempted) {
    if (allErrors[field]) errors[field] = allErrors[field];
  }

  /** Marks the fields of a step as attempted so their errors show; returns true if they are all valid. */
  const checkStep = (stepNumber: number) => {
    const fields = CLINICAL_FORM_STEPS[stepNumber - 1];
    setAttempted((prev) => [...new Set([...prev, ...fields])]);
    return fields.every((field) => !allErrors[field]);
  };

  const goNext = () => {
    if (checkStep(step)) setStep((prev) => Math.min(prev + 1, CLINICAL_FORM_STEPS.length));
  };

  const goBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const setValue = (field: keyof ClinicalEventFormValues, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Before the last step the submit (Siguiente button or Enter) only advances; it never saves an unfinished form.
    if (step < CLINICAL_FORM_STEPS.length) return goNext();

    const firstInvalidStep = CLINICAL_FORM_STEPS.findIndex((fields) => fields.some((field) => allErrors[field]));
    if (firstInvalidStep !== -1) {
      setAttempted(CLINICAL_FORM_STEPS.flat());
      setStep(firstInvalidStep + 1);
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      onSaved(await createClinicalEvent(petId, values));
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, "No se pudo registrar el evento clínico."));
      setSubmitting(false);
    }
  };

  return { values, errors, step, submitting, serverError, setValue, goBack, handleSubmit };
}
