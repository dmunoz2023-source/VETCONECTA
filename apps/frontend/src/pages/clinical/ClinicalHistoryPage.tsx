import { useState } from "react";
import { ClipboardPlus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/common/BackButton/BackButton";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader/PageHeader";
import Notice from "../../components/feedback/Notice";
import StatusText from "../../components/feedback/StatusText";
import { useClinicalEvents } from "../../hooks/useClinicalEvents";
import { useFlashNotice } from "../../hooks/useFlashNotice";
import { usePermissions } from "../../hooks/usePermissions";
import { usePet } from "../../hooks/usePet";
import { CLINICAL_TYPE_OPTIONS } from "../../utils/clinicalLabels";
import { petClinicalEventPath, petDetailPath } from "../../utils/navigation";
import { formatSpecies } from "../../utils/petLabels";
import ClinicalTimeline from "./ClinicalTimeline";
import css from "./ClinicalHistoryPage.module.css";

/**
 * Clinical record of the patient (/pets/:id/clinical-history, FR-2): a timeline filtered
 * by type. After registering an event the user lands here and the event shows first.
 */
export default function ClinicalHistoryPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const can = usePermissions();
  const { notice, dismiss } = useFlashNotice();
  const { pet } = usePet(id);
  const { events, error, loading, reload } = useClinicalEvents(id);
  const [type, setType] = useState("");

  const visibleEvents = type ? events.filter((event) => event.type === type) : events;
  const emptyMessage = type ? "No hay eventos de este tipo." : "Esta mascota aún no tiene eventos clínicos.";
  const countOf = (value: string) => events.filter((event) => event.type === value).length;
  const filters = [
    { value: "", label: "Todos", count: events.length },
    ...CLINICAL_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label, count: countOf(option.value) })),
  ];

  return (
    <div className={css.page}>
      <BackButton to={petDetailPath(id)} label="Volver a la ficha" />
      <PageHeader
        title="Carnet clínico"
        description={pet ? `${pet.name} · ${formatSpecies(pet.species)}` : undefined}
        actions={
          can("registerClinicalEvent") && (
            <Button variant="primary" onClick={() => navigate(petClinicalEventPath(id))}>
              <ClipboardPlus size={16} /> Registrar evento
            </Button>
          )
        }
      />

      {notice && <Notice message={notice} onDismiss={dismiss} />}

      <Card title="Línea de tiempo">
        {!loading && !error && events.length > 0 && (
          <div className={css.filters} role="group" aria-label="Filtrar por tipo de evento">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={css.filter}
                aria-pressed={type === filter.value}
                onClick={() => setType(filter.value)}
              >
                {filter.label} <span className={css.count}>{filter.count}</span>
              </button>
            ))}
          </div>
        )}

        {loading && <StatusText>Cargando...</StatusText>}
        {error && (
          <div role="alert">
            <p className={css.error}>{error}</p>
            <Button onClick={reload}>Reintentar</Button>
          </div>
        )}
        {!loading && !error &&
          (visibleEvents.length > 0 ? (
            <ClinicalTimeline events={visibleEvents} />
          ) : (
            <div className={css.empty}>
              <StatusText>{emptyMessage}</StatusText>
              {!type && can("registerClinicalEvent") && (
                <Button variant="primary" onClick={() => navigate(petClinicalEventPath(id))}>
                  <ClipboardPlus size={16} /> Registrar el primer evento
                </Button>
              )}
            </div>
          ))}
      </Card>
    </div>
  );
}
