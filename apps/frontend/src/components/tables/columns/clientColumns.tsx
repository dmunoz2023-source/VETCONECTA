import { SquarePen, Trash2 } from "lucide-react";
import type { Client } from "../../../types/client.types";
import IconButton from "../../common/IconButton";
import type { TableColumn } from "../DataTable";

interface ClientColumnActions {
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

/** Columnas de la tabla de clientes. Las acciones las entrega la página (abren sus modales). */
export const getClientColumns = ({ onEdit, onDelete }: ClientColumnActions): TableColumn<Client>[] => [
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
    key: "acciones",
    header: "",
    render: (c) => (
      <div className="vc-row-actions">
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