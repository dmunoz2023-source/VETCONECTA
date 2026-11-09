import { useState } from "react";
import { ClipboardPlus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader/PageHeader";
import SelectField from "../../components/common/SelectField";
import Notice from "../../components/feedback/Notice";
import StatusText from "../../components/feedback/StatusText";
import { useClinicalEvents } from "../../hooks/useClinicalEvents";
import { useFlashNotice } from "../../hooks/useFlashNotice";
import { usePermissions } from "../../hooks/usePermissions";
import { usePet } from "../../hooks/usePet";
import { CLINICAL_TYPE_OPTIONS } from "../../utils/clinicalLabels";
import ClinicalTimeline from "./ClinicalTimeline";
import { ROUTES } from "../../utils/navigation";
import "../pets/Pets.css";
import "./Clinical.css";

/**
 * Carnet clínico del paciente (/pets/:id/historial, FR-2): línea de tiempo con
 * filtro por tipo. Tras registrar un evento se llega aquí y el evento aparece primero.
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

  return (
    <div className="vc-dashboard">
      <PageHeader
        title="Carnet clínico"
        description={pet?.name}
        actions={
          <>
            <Button onClick={() => navigate(`${ROUTES.pets}/${id}`)}>Volver a la ficha</Button>
            {can("registerClinicalEvent") && (
              <Button variant="primary" onClick={() => navigate(`${ROUTES.pets}/${id}/atencion`)}>
                <ClipboardPlus size={16} /> Registrar evento
              </Button>
            )}
          </>
        }
      />

      {notice && <Notice message={notice} onDismiss={dismiss} />}

      <Card title="Línea de tiempo">
        <div className="vc-clinical-filter">
          <SelectField
            label="Tipo de evento"
            placeholder="Todos"
            options={CLINICAL_TYPE_OPTIONS}
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>

        {loading && <StatusText>Cargando...</StatusText>}
        {error && (
          <div role="alert">
            <p className="vc-modal-error">{error}</p>
            <Button onClick={reload}>Reintentar</Button>
          </div>
        )}
        {!loading && !error &&
          (visibleEvents.length > 0 ? <ClinicalTimeline events={visibleEvents} /> : <StatusText>{emptyMessage}</StatusText>)}
      </Card>
    </div>
  );
}
