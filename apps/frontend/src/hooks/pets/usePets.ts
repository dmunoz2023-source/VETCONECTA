import { listPets } from "../../api/pets.api";
import type { PetsQuery, PetsResult } from "../../types/pet.types";
import { usePagedRequest } from "../common/usePagedRequest";

const EMPTY_RESULT: PetsResult = { pets: [], total: 0 };

/** Listado de pacientes con búsqueda por dueño y paginación por dueño (ver listPets). */
export function usePets(query: PetsQuery) {
  const { result, loading, error } = usePagedRequest(
    listPets,
    query,
    EMPTY_RESULT,
    "No se pudieron cargar los pacientes.",
  );

  return { pets: result.pets, total: result.total, loading, error };
}
