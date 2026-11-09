import Card from "../../components/common/Card";
import DetailList from "../../components/common/DetailList";
import StatusBadge from "../../components/common/StatusBadge";
import StatusText from "../../components/feedback/StatusText";
import type { Pet } from "../../types/pet.types";
import { formatDate } from "../../utils/formatters";
import SpeciesIcon from "../../components/common/SpeciesIcon";
import { formatSex, formatSpecies } from "../../utils/petLabels";
import css from "./PetSummary.module.css";

/** Pet and owner data on the patient file. */
export default function PetSummary({ pet }: { pet: Pet }) {
  const owner = pet.client;

  return (
    <div className={css.layout}>
      <Card
        title="Datos del paciente"
        actions={
          <StatusBadge label={pet.active ? "Activo" : "Inactivo"} className={pet.active ? css.active : css.inactive} />
        }
      >
        <div className={css.hero}>
          <span className={css.avatar} aria-hidden="true">
            <SpeciesIcon species={pet.species} size={28} />
          </span>
          <div>
            <p className={css.name}>{pet.name}</p>
            <p className={css.subtitle}>
              {formatSpecies(pet.species)}
              {pet.breed ? ` · ${pet.breed}` : ""}
            </p>
          </div>
        </div>
        <DetailList
          items={[
            { label: "Sexo", value: formatSex(pet.sex) },
            { label: "Edad", value: pet.age?.displayAge ?? "—" },
            { label: "Fecha de nacimiento", value: formatDate(pet.birthDate) },
            { label: "Color / señas", value: pet.color ?? "—" },
            { label: "Microchip", value: pet.microchip ?? "—" },
          ]}
        />
      </Card>

      <Card title="Dueño">
        {owner ? (
          <div className={css.owner}>
            <span className={css.ownerAvatar} aria-hidden="true">
              {`${owner.firstName.charAt(0)}${owner.lastName.charAt(0)}`.toUpperCase()}
            </span>
            <div>
              <p className={css.ownerName}>
                {owner.firstName} {owner.lastName}
              </p>
              <p className={css.subtitle}>RUT {owner.rut}</p>
            </div>
          </div>
        ) : (
          <StatusText>Sin datos del dueño.</StatusText>
        )}
      </Card>
    </div>
  );
}
