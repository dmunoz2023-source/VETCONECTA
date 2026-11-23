import { useState } from "react";
import { Plus, X } from "lucide-react";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import IconButton from "../../../components/common/IconButton";
import SelectField from "../../../components/common/SelectField";
import StatusText from "../../../components/feedback/StatusText";
import { getErrorMessage } from "../../../api/axios";
import type { Specialty } from "../../../types/agenda.types";

interface VetSpecialtiesCardProps {
  /** Catálogo completo de especialidades activas. */
  specialties: Specialty[];
  /** Especialidades que ya atiende el veterinario. */
  vetSpecialties: Specialty[];
  loading: boolean;
  error: string | null;
  onAssign: (specialtyId: string) => Promise<void>;
  onUnassign: (specialty: Specialty) => Promise<void>;
}

/** Especialidades que atiende el veterinario elegido: asignar y quitar. */
export default function VetSpecialtiesCard({
  specialties,
  vetSpecialties,
  loading,
  error,
  onAssign,
  onUnassign,
}: VetSpecialtiesCardProps) {
  const [selected, setSelected] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const assignedIds = new Set(vetSpecialties.map((s) => s.id));
  const available = specialties.filter((s) => !assignedIds.has(s.id));

  const run = async (action: () => Promise<void>, fallback: string) => {
    setActionError(null);
    try {
      await action();
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, fallback));
    }
  };

  const handleAssign = () =>
    run(async () => {
      await onAssign(selected);
      setSelected("");
    }, "No se pudo asignar la especialidad.");

  const renderList = () => {
    if (error) return <StatusText>{error}</StatusText>;
    if (loading && vetSpecialties.length === 0) return <StatusText>Cargando...</StatusText>;
    if (vetSpecialties.length === 0) {
      return <StatusText>Este veterinario aún no atiende ninguna especialidad. Asígnale al menos una.</StatusText>;
    }
    return (
      <ul className="vc-chip-list">
        {vetSpecialties.map((s) => (
          <li key={s.id} className="vc-chip">
            <span>
              {s.name} · {s.durationMinutes} min
            </span>
            <IconButton
              label={`Quitar ${s.name}`}
              variant="danger"
              onClick={() => void run(() => onUnassign(s), "No se pudo quitar la especialidad.")}
            >
              <X size={14} />
            </IconButton>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card title="Especialidades del veterinario">
      {renderList()}

      <div className="vc-inline-form">
        <SelectField
          label="Asignar especialidad"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          options={available.map((s) => ({ value: s.id, label: `${s.name} (${s.durationMinutes} min)` }))}
          placeholder={available.length ? "Selecciona..." : "No quedan especialidades por asignar"}
          disabled={available.length === 0}
        />
        <Button type="button" variant="primary" disabled={!selected} onClick={() => void handleAssign()}>
          <Plus size={16} /> Asignar
        </Button>
      </div>

      {actionError && (
        <p className="vc-modal-error" role="alert">
          {actionError}
        </p>
      )}
    </Card>
  );
}
