import { useState } from "react";
import Card from "../../../components/common/Card";
import PageHeader from "../../../components/common/PageHeader/PageHeader";
import SelectField from "../../../components/common/SelectField";
import Notice from "../../../components/feedback/Notice";
import StatusText from "../../../components/feedback/StatusText";
import { useSpecialties } from "../../../hooks/useSpecialties";
import { useVetBlocks } from "../../../hooks/useVetBlocks";
import { useVetSchedules } from "../../../hooks/useVetSchedules";
import { useVetSpecialties } from "../../../hooks/useVetSpecialties";
import { useVets } from "../../../hooks/useVets";
import type { Specialty, SpecialtyFormValues } from "../../../types/agenda.types";
import BlocksCard from "./BlocksCard";
import SpecialtiesCard from "./SpecialtiesCard";
import VetSpecialtiesCard from "./VetSpecialtiesCard";
import WeeklyScheduleCard from "./WeeklyScheduleCard";
import "./AgendaConfig.css";

/**
 * [L1] Configuración de agenda (FR-7, UC-07), solo recepción y admin:
 * especialidades y su duración, especialidades por veterinario, horario
 * semanal y bloqueos. Consume los endpoints de G3 vía el API Gateway.
 */
export default function AgendaConfigPage() {
  const specialties = useSpecialties();
  const { vets, loading: vetsLoading, error: vetsError } = useVets();
  const [vetId, setVetId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const vetSpecialties = useVetSpecialties(vetId);
  const schedules = useVetSchedules(vetId);
  const blocks = useVetBlocks(vetId);

  // Un cambio en el catálogo (duración, desactivar) cambia lo que muestra el veterinario elegido.
  const saveSpecialty = async (values: SpecialtyFormValues, specialty: Specialty | null) => {
    await specialties.saveSpecialty(values, specialty);
    vetSpecialties.reload();
  };
  const removeSpecialty = async (specialty: Specialty) => {
    await specialties.removeSpecialty(specialty);
    vetSpecialties.reload();
  };

  const renderVetPicker = () => {
    if (vetsError) return <StatusText>{vetsError}</StatusText>;
    if (vetsLoading && vets.length === 0) return <StatusText>Cargando veterinarios...</StatusText>;
    if (vets.length === 0) return <StatusText>No hay veterinarios activos registrados.</StatusText>;
    return (
      <SelectField
        label="Veterinario"
        value={vetId ?? ""}
        onChange={(e) => setVetId(e.target.value || null)}
        options={vets.map((vet) => ({
          value: vet.userId,
          label: `${vet.firstName} ${vet.lastName}${vet.professionalLicense ? ` · ${vet.professionalLicense}` : ""}`,
        }))}
        placeholder="Selecciona un veterinario..."
      />
    );
  };

  return (
    <div className="vc-dashboard vc-agenda-config">
      <PageHeader
        title="Configuración de agenda"
        description="Especialidades, horario semanal y bloqueos de cada veterinario."
      />

      {notice && <Notice message={notice} onDismiss={() => setNotice(null)} />}

      <SpecialtiesCard
        specialties={specialties.specialties}
        loading={specialties.loading}
        error={specialties.error}
        onSave={saveSpecialty}
        onRemove={removeSpecialty}
      />

      <Card title="Agenda por veterinario">
        <div className="vc-inline-form">{renderVetPicker()}</div>
      </Card>

      {vetId && (
        <>
          <VetSpecialtiesCard
            specialties={specialties.specialties}
            vetSpecialties={vetSpecialties.vetSpecialties}
            loading={vetSpecialties.loading}
            error={vetSpecialties.error}
            onAssign={vetSpecialties.assign}
            onUnassign={vetSpecialties.unassign}
          />
          <WeeklyScheduleCard
            schedules={schedules.schedules}
            vetSpecialties={vetSpecialties.vetSpecialties}
            loading={schedules.loading}
            error={schedules.error}
            onSave={schedules.saveSchedule}
            onRemove={schedules.removeSchedule}
          />
          <BlocksCard
            blocks={blocks.blocks}
            schedules={schedules.schedules}
            vetSpecialties={vetSpecialties.vetSpecialties}
            loading={blocks.loading}
            error={blocks.error}
            onSave={blocks.saveBlock}
            onRemove={blocks.removeBlock}
            onNotice={setNotice}
          />
        </>
      )}
    </div>
  );
}
