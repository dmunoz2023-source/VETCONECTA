import { useCallback } from "react";
import { useAsync } from "./useAsync";

/**
 * Lista que depende del veterinario elegido: sin veterinario queda vacía y no
 * llama a la API. `fetchFor` debe ser estable (una función del módulo, no una
 * creada en cada render), igual que en useAsync.
 */
export function useVetResource<T>(
  vetId: string | null,
  fetchFor: (vetId: string) => Promise<T[]>,
  errorMessage: string,
) {
  const load = useCallback(
    (): Promise<T[]> => (vetId ? fetchFor(vetId) : Promise.resolve([])),
    [vetId, fetchFor],
  );
  const { data, loading, error, reload } = useAsync(load, errorMessage);
  return { items: data ?? [], loading, error, reload };
}
