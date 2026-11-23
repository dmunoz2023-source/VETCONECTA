import { useCallback } from "react";
import { createVetSchedule, deleteVetSchedule, listVetSchedules, updateVetSchedule } from "../api/scheduling.api";
import type { ScheduleFormValues, VetSchedule } from "../types/agenda.types";
import { useVetResource } from "./useVetResource";

/** Horario semanal de un veterinario con alta, edición y borrado de turnos. */
export function useVetSchedules(vetId: string | null) {
  const { items, loading, error, reload } = useVetResource(vetId, listVetSchedules, "No se pudo cargar el horario semanal.");

  const saveSchedule = useCallback(
    async (values: ScheduleFormValues, schedule: VetSchedule | null) => {
      if (!vetId) return;
      if (schedule) await updateVetSchedule(vetId, schedule.id, values);
      else await createVetSchedule(vetId, values);
      reload();
    },
    [vetId, reload],
  );

  const removeSchedule = useCallback(
    async (schedule: VetSchedule) => {
      if (!vetId) return;
      await deleteVetSchedule(vetId, schedule.id);
      reload();
    },
    [vetId, reload],
  );

  return { schedules: items, loading, error, saveSchedule, removeSchedule };
}
