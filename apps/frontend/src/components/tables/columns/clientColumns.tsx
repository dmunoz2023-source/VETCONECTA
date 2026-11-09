import { PawPrint, SquarePen, Trash2 } from "lucide-react";
import type { Client } from "../../../types/client.types";
import IconButton from "../../common/IconButton";
import type { TableColumn } from "../DataTable";
import css from "./clientColumns.module.css";

interface ClientColumnActions {
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  /** When provided, shows the "Agregar mascota" button (UC-05, step 2). */
  onAddPet?: (client: Client) => void;
}

/** Columns of the clients table. The actions are provided by the page (they open its modals). */
export const getClientColumns = ({ onEdit, onDelete, onAddPet }: ClientColumnActions): TableColumn<Client>[] => [
  {
    key: "name",
    header: "Nombre",
    render: (c) => (
      <span className="vc-pet-name">
        {c.firstName} {c.lastName}
      </span>
    ),
  },
  { key: "rut", header: "RUT", render: (c) => c.rut },
  { key: "phone", header: "Teléfono", render: (c) => c.phone ?? "—" },
  { key: "email", header: "Correo Electrónico", render: (c) => c.email },
  {
    key: "actions",
    header: "",
    render: (c) => (
      <div className="vc-row-actions">
        {onAddPet && (
          <button
            type="button"
            className={css.addPet}
            aria-label={`Agregar mascota a ${c.firstName} ${c.lastName}`}
            onClick={() => onAddPet(c)}
          >
            <PawPrint size={14} aria-hidden="true" />
            Agregar mascota
          </button>
        )}
        <IconButton label={`Editar a ${c.firstName} ${c.lastName}`} onClick={() => onEdit(c)}>
          <SquarePen size={16} />
        </IconButton>
        <IconButton label={`Eliminar a ${c.firstName} ${c.lastName}`} variant="danger" onClick={() => onDelete(c)}>
          <Trash2 size={16} />
        </IconButton>
      </div>
    ),
  },
];