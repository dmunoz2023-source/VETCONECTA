import type { Pet } from "../../../types/pet.types";
import { formatSex, formatSpecies } from "../../../utils/petLabels";
import type { TableColumn } from "../DataTable";

/** Columnas de la tabla de pacientes. */
export const getPetColumns = (): TableColumn<Pet>[] => [
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
];
