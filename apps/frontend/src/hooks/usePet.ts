import { useCallback } from "react";
import { deactivatePet, getPet } from "../api/pets.api";
import { useAsync } from "./useAsync";

/** Ficha de una mascota (GET /v1/pets/{id}) y su baja lógica (DELETE /v1/pets/{id}). */
export function usePet(id: string) {
  const load = useCallback(() => getPet(id), [id]);
  const { data: pet, error, loading } = useAsync(load, "No se pudo cargar la ficha del paciente.");

  /** Desactiva la mascota. Si la API falla, la promesa se rechaza para que la pantalla muestre el error. */
  const deactivate = useCallback(() => deactivatePet(id), [id]);

  return { pet, error, loading, deactivate };
}
