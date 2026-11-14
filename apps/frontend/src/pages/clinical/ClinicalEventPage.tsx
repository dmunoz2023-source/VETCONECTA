import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/common/BackButton/BackButton";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader/PageHeader";
import StatusText from "../../components/feedback/StatusText";
import { usePet } from "../../hooks/usePet";
import { formatSpecies } from "../../utils/petLabels";
import { petClinicalHistoryPath, petDetailPath } from "../../utils/navigation";
import ClinicalEventForm from "./ClinicalEventForm";
import css from "./ClinicalEventPage.module.css";

/**
 * Registers a clinical event from the patient file (/pets/:id/clinical-event, FR-6).
 * The route is only available to the veterinarian (BR-6); on save the clinical record opens.
 */
export default function ClinicalEventPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { pet, error, loading } = usePet(id);

  return (
    <div className={css.page}>
      <BackButton to={petDetailPath(id)} label="Volver a la ficha" />
      <PageHeader
        title="Registrar evento clínico"
        description={pet ? `${pet.name} · ${formatSpecies(pet.species)}` : undefined}
      />

      <Card>
        {loading && <StatusText>Cargando...</StatusText>}
        {error && (
          <p className={css.error} role="alert">
            {error}
          </p>
        )}
        {pet && (
          <ClinicalEventForm
            petId={pet.id}
            onSaved={() => navigate(petClinicalHistoryPath(pet.id), { state: { notice: "Evento clínico registrado." } })}
            onCancel={() => navigate(petDetailPath(pet.id))}
          />
        )}
      </Card>
    </div>
  );
}
