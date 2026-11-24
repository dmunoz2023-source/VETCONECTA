import { useCallback } from "react";
import { createSpecialty, deactivateSpecialty, listSpecialties, updateSpecialty } from "../../api/catalog.api";
import type { Specialty, SpecialtyFormValues } from "../../types/agenda.types";
import { useAsync } from "../common/useAsync";

/** Catálogo de especialidades activas (GET /v1/catalog/specialties) con alta, edición y baja lógica. */
export function useSpecialties() {
  const { data, loading, error, reload } = useAsync(listSpecialties, "No se pudieron cargar las especialidades.");

  const saveSpecialty = useCallback(
    async (values: SpecialtyFormValues, specialty: Specialty | null) => {
      if (specialty) await updateSpecialty(specialty.id, values);
      else await createSpecialty(values);
      reload();
    },
    [reload],
  );

  const removeSpecialty = useCallback(
    async (specialty: Specialty) => {
      await deactivateSpecialty(specialty.id);
      reload();
    },
    [reload],
  );

  return { specialties: data ?? [], loading, error, saveSpecialty, removeSpecialty };
}
