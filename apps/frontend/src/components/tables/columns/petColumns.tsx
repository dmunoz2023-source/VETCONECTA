import { Eye } from "lucide-react";
import type { Pet } from "../../../types/pet.types";
import { formatSex, formatSpecies } from "../../../utils/petLabels";
import IconButton from "../../common/IconButton";
import type { TableColumn } from "../DataTable";

interface PetColumnActions {
  onView: (pet: Pet) => void;
}

/** Columnas de la tabla de pacientes. La acción "Ver ficha" la entrega la página. */
export const getPetColumns = ({ onView }: PetColumnActions): TableColumn<Pet>[] => [
  {
    key: "name",
    header: "Paciente",
    render: (p) => <span className="vc-pet-name">{p.name}</span>,
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
    key: "acciones",
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
