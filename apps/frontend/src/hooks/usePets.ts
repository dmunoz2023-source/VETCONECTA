import { listPets } from "../api/pets.api";
import type { PetsQuery, PetsResult } from "../types/pet.types";
import { usePagedRequest } from "./usePagedRequest";

const EMPTY_RESULT: PetsResult = { pets: [], total: 0 };

/** Listado de pacientes con búsqueda (mascota o dueño) y paginación. Consume GET /v1/pets. */
export function usePets(query: PetsQuery) {
  const { result, loading, error } = usePagedRequest(
    listPets,
    query,
    EMPTY_RESULT,
    "No se pudieron cargar los pacientes.",
  );

  return { pets: result.pets, total: result.total, loading, error };
}
