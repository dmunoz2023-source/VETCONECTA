import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader/PageHeader";
import StatusText from "../../components/feedback/StatusText";
import { usePetFormData } from "../../hooks/pets/usePetFormData";
import type { Pet } from "../../types/pet.types";
import PetForm from "./PetForm";
import "./Pets.css";
import { ROUTES } from "../../utils/navigation";

/**
 * Alta (/mascotas/nueva) y edición (/mascotas/:id/editar) de una mascota (FR-5).
 * Con ?clientId= el dueño llega ya elegido (botón "Agregar mascota" de Clientes).
 */
export default function PetFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const presetClientId = searchParams.get("clientId") ?? undefined;
  const navigate = useNavigate();
  const { data, error, loading } = usePetFormData(id, presetClientId);

  // Cancelar vuelve a donde tiene sentido, aunque el formulario se haya abierto desde un enlace directo.
  const cancelPath = id ? `${ROUTES.pets}/${id}` : presetClientId ? ROUTES.clients : ROUTES.pets;

  const handleSaved = (pet: Pet) => {
    const notice = id ? `Se guardaron los cambios de ${pet.name}.` : `${pet.name} se registró como paciente.`;
    navigate(`${ROUTES.pets}/${pet.id}`, { state: { notice } });
  };

  return (
    <div className="vc-dashboard">
      <PageHeader
        title={id ? "Editar mascota" : "Nueva mascota"}
        description="Los datos quedan disponibles en la app del dueño."
      />

      <Card>
        {loading && <StatusText>Cargando...</StatusText>}
        {error && (
          <p className="vc-modal-error" role="alert">
            {error}
          </p>
        )}
        {data && (
          <PetForm
            initialValues={data.initialValues}
            initialOwner={data.initialOwner}
            petId={id}
            onSaved={handleSaved}
            onCancel={() => navigate(cancelPath)}
          />
        )}
      </Card>
    </div>
  );
}
