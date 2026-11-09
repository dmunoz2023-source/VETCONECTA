import { useState } from "react";
import type { FormEvent } from "react";
import { getErrorMessage } from "../api/axios";
import { createPet, updatePet } from "../api/pets.api";
import type { Pet, PetFormValues, PetOwner } from "../types/pet.types";
import { validatePetForm } from "../utils/petValidators";

interface UsePetFormOptions {
  initialValues: PetFormValues;
  initialOwner: PetOwner | null;
  /** Pet to edit; without `petId` a new one is created. */
  petId?: string;
  onSaved: (pet: Pet) => void;
}

/**
 * State and submission of the pet form. Validates with the same rules as the
 * backend before sending; errors show after the first save attempt
 * and update while the user fixes them. If the API answers with an error
 * (400, 403, 404 for the owner), the message goes to `serverError`.
 */
export function usePetForm({ initialValues, initialOwner, petId, onSaved }: UsePetFormOptions) {
  const [values, setValues] = useState(initialValues);
  const [owner, setOwnerState] = useState(initialOwner);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const errors = submitted ? validatePetForm(values) : {};

  const setValue = (field: keyof PetFormValues, value: string) => setValues((prev) => ({ ...prev, [field]: value }));

  const setOwner = (next: PetOwner | null) => {
    setOwnerState(next);
    setValue("clientId", next?.id ?? "");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(validatePetForm(values)).length > 0) return;

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

  return { values, owner, errors, submitting, serverError, setValue, setOwner, handleSubmit };
}
