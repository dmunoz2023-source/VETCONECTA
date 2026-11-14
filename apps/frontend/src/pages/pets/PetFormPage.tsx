import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import BackButton from "../../components/common/BackButton/BackButton";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader/PageHeader";
import StatusText from "../../components/feedback/StatusText";
import { usePetFormData } from "../../hooks/usePetFormData";
import type { Pet } from "../../types/pet.types";
import PetForm from "./PetForm";
import css from "./PetFormPage.module.css";
import { ROUTES } from "../../utils/navigation";

/**
 * Create (/pets/new) and edit (/pets/:id/edit) a pet (FR-5).
 * With ?clientId= the owner arrives already chosen ("Agregar mascota" button in Clients).
 */
export default function PetFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const presetClientId = searchParams.get("clientId") ?? undefined;
  const navigate = useNavigate();
  const { data, error, loading } = usePetFormData(id, presetClientId);

  // Cancel and back go where it makes sense, even if the form was opened from a direct link.
  const back = id
    ? { path: `${ROUTES.pets}/${id}`, label: "Volver a la ficha" }
    : presetClientId
      ? { path: ROUTES.clients, label: "Volver a clientes" }
      : { path: ROUTES.pets, label: "Volver a pacientes" };

  const handleSaved = (pet: Pet) => {
    const notice = id ? `Se guardaron los cambios de ${pet.name}.` : `${pet.name} se registró como paciente.`;
    navigate(`${ROUTES.pets}/${pet.id}`, { state: { notice } });
  };

  return (
    <div className={css.page}>
      <BackButton to={back.path} label={back.label} />
      <PageHeader
        title={id ? "Editar mascota" : "Nueva mascota"}
        description="Los datos quedan disponibles en la app del dueño."
      />

      <Card>
        {loading && <StatusText>Cargando...</StatusText>}
        {error && (
          <p className={css.error} role="alert">
            {error}
          </p>
        )}
        {data && (
          <PetForm
            initialValues={data.initialValues}
            initialOwner={data.initialOwner}
            petId={id}
            onSaved={handleSaved}
            onCancel={() => navigate(back.path)}
          />
        )}
      </Card>
    </div>
  );
}
