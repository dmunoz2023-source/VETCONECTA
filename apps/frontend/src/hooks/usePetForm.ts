import { useState } from "react";
import type { FormEvent } from "react";
import { getErrorMessage } from "../api/axios";
import { createPet, updatePet } from "../api/pets.api";
import type { Pet, PetFormValues, PetOwner } from "../types/pet.types";
import { PET_FORM_STEPS, validatePetForm } from "../utils/petValidators";
import type { PetFormErrors } from "../utils/petValidators";

interface UsePetFormOptions {
  initialValues: PetFormValues;
  initialOwner: PetOwner | null;
  /** Pet to edit; without `petId` a new one is created. */
  petId?: string;
  onSaved: (pet: Pet) => void;
}

/**
 * State and submission of the pet form, which is filled in steps (owner, patient data, details).
 * Validates with the same rules as the backend: each step is checked before moving on,
 * and the whole form again before sending. A field shows its error only after the user
 * tried to leave its step, and it updates while they fix it. If the API answers with an error
 * (400, 403, 404 for the owner), the message goes to `serverError`.
 */
export function usePetForm({ initialValues, initialOwner, petId, onSaved }: UsePetFormOptions) {
  const [values, setValues] = useState(initialValues);
  const [owner, setOwnerState] = useState(initialOwner);
  const [step, setStep] = useState(1);
  const [attempted, setAttempted] = useState<(keyof PetFormValues)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const allErrors = validatePetForm(values);
  const errors: PetFormErrors = {};
  for (const field of attempted) {
    if (allErrors[field]) errors[field] = allErrors[field];
  }

  /** Marks the fields of a step as attempted so their errors show; returns true if they are all valid. */
  const checkStep = (stepNumber: number) => {
    const fields = PET_FORM_STEPS[stepNumber - 1];
    setAttempted((prev) => [...new Set([...prev, ...fields])]);
    return fields.every((field) => !allErrors[field]);
  };

  const goNext = () => {
    if (checkStep(step)) setStep((prev) => Math.min(prev + 1, PET_FORM_STEPS.length));
  };

  const goBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const setValue = (field: keyof PetFormValues, value: string) => setValues((prev) => ({ ...prev, [field]: value }));

  const setOwner = (next: PetOwner | null) => {
    setOwnerState(next);
    setValue("clientId", next?.id ?? "");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Before the last step the submit (Siguiente button or Enter) only advances; it never saves an unfinished form.
    if (step < PET_FORM_STEPS.length) return goNext();

    const firstInvalidStep = PET_FORM_STEPS.findIndex((fields) => fields.some((field) => allErrors[field]));
    if (firstInvalidStep !== -1) {
      setAttempted(PET_FORM_STEPS.flat());
      setStep(firstInvalidStep + 1);
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      const saved = petId ? await updatePet(petId, values) : await createPet(values);
      onSaved(saved);
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, "No se pudo guardar la mascota."));
      setSubmitting(false);
    }
  };

  return { values, owner, errors, step, submitting, serverError, setValue, setOwner, goBack, handleSubmit };
}
