import { useCallback } from "react";
import { assignVetSpecialty, listVetSpecialties, unassignVetSpecialty } from "../../api/catalog.api";
import type { Specialty } from "../../types/agenda.types";
import { useVetResource } from "../common/useVetResource";

/**
 * Especialidades que atiende un veterinario. La API también devuelve las
 * desactivadas del catálogo; se ocultan porque ya no generan bloques.
 * `reload` sirve para refrescarlas cuando cambia el catálogo (p. ej. la duración).
 */
export function useVetSpecialties(vetId: string | null) {
  const { items, loading, error, reload } = useVetResource(
    vetId,
    listVetSpecialties,
    "No se pudieron cargar las especialidades del veterinario.",
  );

  const assign = useCallback(
    async (specialtyId: string) => {
      if (!vetId) return;
      await assignVetSpecialty(vetId, specialtyId);
      reload();
    },
    [vetId, reload],
  );

  const unassign = useCallback(
    async (specialty: Specialty) => {
      if (!vetId) return;
      await unassignVetSpecialty(vetId, specialty.id);
      reload();
    },
    [vetId, reload],
  );

  return { vetSpecialties: items.filter((s) => s.active), loading, error, assign, unassign, reload };
}
