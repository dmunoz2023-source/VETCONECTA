import { useCallback } from "react";
import { createVetBlock, deleteVetBlock, listVetBlocks, updateVetBlock } from "../../api/scheduling.api";
import type { BlockFormValues, VetBlock, VetBlockResult } from "../../types/agenda.types";
import { clinicToday } from "../../utils/agenda";
import { useVetResource } from "../common/useVetResource";

/** Bloqueos desde hoy (la fecha se toma en cada carga). */
const listUpcomingBlocks = (vetId: string) => listVetBlocks(vetId, { from: clinicToday() });

/**
 * Bloqueos vigentes (desde hoy) de un veterinario. Al guardar devuelve las citas
 * que quedan dentro del bloqueo para advertirlas; la API no las cancela.
 */
export function useVetBlocks(vetId: string | null) {
  const { items, loading, error, reload } = useVetResource(vetId, listUpcomingBlocks, "No se pudieron cargar los bloqueos.");

  const saveBlock = useCallback(
    async (values: BlockFormValues, block: VetBlock | null): Promise<VetBlockResult | null> => {
      if (!vetId) return null;
      const result = block ? await updateVetBlock(vetId, block.id, values) : await createVetBlock(vetId, values);
      reload();
      return result;
    },
    [vetId, reload],
  );

  const removeBlock = useCallback(
    async (block: VetBlock) => {
      if (!vetId) return;
      await deleteVetBlock(vetId, block.id);
      reload();
    },
    [vetId, reload],
  );

  return { blocks: items, loading, error, saveBlock, removeBlock };
}
