import Card from "../../components/common/Card";
import DetailList from "../../components/common/DetailList";
import StatusBadge from "../../components/common/StatusBadge";
import StatusText from "../../components/feedback/StatusText";
import type { Pet } from "../../types/pet.types";
import { formatDate } from "../../utils/formatters";
import { formatSex, formatSpecies } from "../../utils/petLabels";

/** Datos de la mascota y de su dueño en la ficha del paciente. */
export default function PetSummary({ pet }: { pet: Pet }) {
  return (
    <div className="vc-pet-summary">
      <Card
        title="Datos del paciente"
        actions={
          <StatusBadge
            label={pet.active ? "Activo" : "Inactivo"}
            className={pet.active ? "vc-badge-active" : "vc-badge-inactive"}
          />
        }
      >
        <DetailList
          items={[
            { label: "Especie", value: formatSpecies(pet.species) },
            { label: "Raza", value: pet.breed ?? "—" },
            { label: "Sexo", value: formatSex(pet.sex) },
            { label: "Fecha de nacimiento", value: formatDate(pet.birthDate) },
            { label: "Edad", value: pet.age?.displayAge ?? "—" },
            { label: "Color / señas", value: pet.color ?? "—" },
            { label: "Microchip", value: pet.microchip ?? "—" },
          ]}
        />
      </Card>

      <Card title="Dueño">
        {pet.client ? (
          <DetailList
            items={[
              { label: "Nombre", value: `${pet.client.firstName} ${pet.client.lastName}` },
              { label: "RUT", value: pet.client.rut },
            ]}
          />
        ) : (
          <StatusText>Sin datos del dueño.</StatusText>
        )}
      </Card>
    </div>
  );
}
