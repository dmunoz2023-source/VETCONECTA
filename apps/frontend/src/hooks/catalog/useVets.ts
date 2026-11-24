import { listVets } from "../../api/catalog.api";
import { useAsync } from "../common/useAsync";

/** Veterinarios activos de la clínica (GET /v1/catalog/vets). */
export function useVets() {
  const { data, loading, error } = useAsync(listVets, "No se pudieron cargar los veterinarios.");
  return { vets: data ?? [], loading, error };
}
