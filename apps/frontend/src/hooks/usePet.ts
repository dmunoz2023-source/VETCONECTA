import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../api/axios";
import { deactivatePet, getPet } from "../api/pets.api";
import type { Pet } from "../types/pet.types";

interface PetState {
  id: string;
  pet: Pet | null;
  error: string | null;
}

/** Ficha de una mascota (GET /v1/pets/{id}) y su baja lógica (DELETE /v1/pets/{id}). */
export function usePet(id: string) {
  const [state, setState] = useState<PetState>({ id: "", pet: null, error: null });

  useEffect(() => {
    let cancelled = false;

    getPet(id)
      .then((pet) => {
        if (!cancelled) setState({ id, pet, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ id, pet: null, error: getErrorMessage(err, "No se pudo cargar la ficha del paciente.") });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  /** Desactiva la mascota. Si la API falla, la promesa se rechaza para que la pantalla muestre el error. */
  const deactivate = useCallback(() => deactivatePet(id), [id]);

  return { pet: state.pet, error: state.error, loading: state.id !== id, deactivate };
}
