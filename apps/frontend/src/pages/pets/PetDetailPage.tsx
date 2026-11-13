import { useState } from "react";
import { ClipboardPlus, History, Pencil, PowerOff } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/common/BackButton/BackButton";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader/PageHeader";
import ConfirmDialog from "../../components/feedback/ConfirmDialog";
import Notice from "../../components/feedback/Notice";
import StatusText from "../../components/feedback/StatusText";
import { getErrorMessage } from "../../api/axios";
import { useFlashNotice } from "../../hooks/useFlashNotice";
import { usePermissions } from "../../hooks/usePermissions";
import { usePet } from "../../hooks/usePet";
import PetSummary from "./PetSummary";
import "./Pets.css";
import { petClinicalEventPath, petClinicalHistoryPath, ROUTES } from "../../utils/navigation";

/** Ficha del paciente: datos, dueño y accesos a registrar evento (I2) e historial (FR-5, FR-2). */
export default function PetDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const can = usePermissions();
  const { notice, dismiss } = useFlashNotice();
  const { pet, error, loading, deactivate } = usePet(id);
  const [confirming, setConfirming] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  const closeConfirm = () => {
    setConfirming(false);
    setDeactivateError(null);
  };

  // Baja lógica: la mascota deja de aparecer, pero su historial clínico se conserva (BR-9).
  const handleDeactivate = async () => {
    setDeactivateError(null);
    try {
      await deactivate();
      navigate(ROUTES.pets, { state: { notice: `${pet?.name} se desactivó.` } });
    } catch (err: unknown) {
      setDeactivateError(getErrorMessage(err, "No se pudo desactivar la mascota."));
    }
  };

  if (loading || !pet) {
    return (
      <div className="vc-dashboard">
        <BackButton to={ROUTES.pets} label="Volver a pacientes" />
        <PageHeader title="Ficha del paciente" />
        <Card>
          {error ? (
            <p className="vc-modal-error" role="alert">
              {error}
            </p>
          ) : (
            <StatusText>Cargando...</StatusText>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="vc-dashboard">
      <BackButton to={ROUTES.pets} label="Volver a pacientes" />
      <PageHeader
        title={pet.name}
        description="Ficha del paciente"
        actions={
          <>
            {can("registerClinicalEvent") && (
              <Button variant="primary" onClick={() => navigate(petClinicalEventPath(pet.id))}>
                <ClipboardPlus size={16} /> Registrar evento
              </Button>
            )}
            {can("viewClinicalHistory") && (
              <Button onClick={() => navigate(petClinicalHistoryPath(pet.id))}>
                <History size={16} /> Historial
              </Button>
            )}
            {can("editPet") && (
              <Button onClick={() => navigate(`${ROUTES.pets}/${pet.id}/editar`)}>
                <Pencil size={16} /> Editar
              </Button>
            )}
            {can("deactivatePet") && pet.active && (
              <Button className="vc-btn-danger" onClick={() => setConfirming(true)}>
                <PowerOff size={16} /> Desactivar
              </Button>
            )}
          </>
        }
      />

      {notice && <Notice message={notice} onDismiss={dismiss} />}

      <PetSummary pet={pet} />

      {confirming && (
        <ConfirmDialog
          title="Desactivar mascota"
          message={`¿Desactivar a ${pet.name}? Dejará de aparecer en los listados, pero su historial clínico se conserva.`}
          confirmLabel="Desactivar"
          error={deactivateError}
          onCancel={closeConfirm}
          onConfirm={handleDeactivate}
        />
      )}
    </div>
  );
}
