import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import StatusText from "../../components/feedback/StatusText";
import { usePet } from "../../hooks/usePet";
import ClinicalEventForm from "./ClinicalEventForm";
import { ROUTES } from "../../utils/navigation";
import "../pets/Pets.css";

/**
 * Registro de un evento clínico desde la ficha del paciente (/pets/:id/atencion, FR-6).
 * La ruta solo está disponible para el veterinario (BR-6); al guardar se abre el carnet.
 */
export default function ClinicalEventPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { pet, error, loading } = usePet(id);

  return (
    <div className="vc-dashboard">
      <PageHeader title="Registrar evento clínico" description={pet?.name} />

      <Card>
        {loading && <StatusText>Cargando...</StatusText>}
        {error && (
          <p className="vc-modal-error" role="alert">
            {error}
          </p>
        )}
        {pet && (
          <ClinicalEventForm
            petId={pet.id}
            onSaved={() =>
              navigate(`${ROUTES.pets}/${pet.id}/historial`, { state: { notice: "Evento clínico registrado." } })
            }
            onCancel={() => navigate(`${ROUTES.pets}/${pet.id}`)}
          />
        )}
      </Card>
    </div>
  );
}
