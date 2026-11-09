import { useCallback } from "react";
import { listClinicalEvents } from "../api/clinical.api";
import { useAsync } from "./useAsync";

/** A pet's clinical record (GET /v1/clinical/pets/{petId}/carnet), with `reload` to retry. */
export function useClinicalEvents(petId: string) {
  const load = useCallback(() => listClinicalEvents(petId), [petId]);
  const { data, error, loading, reload } = useAsync(load, "No se pudo cargar el carnet clínico.");
  return { events: data ?? [], error, loading, reload };
}
