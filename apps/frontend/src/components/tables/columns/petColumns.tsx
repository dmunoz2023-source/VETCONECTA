import { Eye } from "lucide-react";
import type { Pet } from "../../../types/pet.types";
import SpeciesIcon from "../../common/SpeciesIcon";
import { formatSex, formatSpecies } from "../../../utils/petLabels";
import IconButton from "../../common/IconButton";
import type { TableColumn } from "../DataTable";
import css from "./petColumns.module.css";

interface PetColumnActions {
  onView: (pet: Pet) => void;
}

/** Columns of the patients table. The "view file" action is provided by the page. */
export const getPetColumns = ({ onView }: PetColumnActions): TableColumn<Pet>[] => [
  {
    key: "name",
    header: "Paciente",
    render: (p) => (
      <div className={css.pet}>
        <span className={css.avatar}>
          <SpeciesIcon species={p.species} />
        </span>
        <span className="vc-pet-name">{p.name}</span>
      </div>
    ),
  },
  { key: "species", header: "Especie", render: (p) => formatSpecies(p.species) },
  { key: "breed", header: "Raza", render: (p) => p.breed ?? "—" },
  { key: "sex", header: "Sexo", render: (p) => formatSex(p.sex) },
  { key: "age", header: "Edad", render: (p) => p.age?.displayAge ?? "—" },
  {
    key: "owner",
    header: "Dueño",
    render: (p) =>
      p.client ? (
        <div>
          <div>
            {p.client.firstName} {p.client.lastName}
          </div>
          <div className="vc-pet-meta">{p.client.rut}</div>
        </div>
      ) : (
        "—"
      ),
  },
  {
    key: "actions",
    header: "",
    render: (p) => (
      <div className="vc-row-actions">
        <IconButton label={`Ver ficha de ${p.name}`} onClick={() => onView(p)}>
          <Eye size={16} />
        </IconButton>
      </div>
    ),
  },
];
