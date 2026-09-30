import { SquarePen, Trash2 } from "lucide-react";
import type { Client } from "../../../types/client.types";
import IconButton from "../../common/IconButton";
import StatusBadge from "../../common/StatusBadge";
import type { TableColumn } from "../DataTable";

interface ClientColumnActions {
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

/** Columnas de la tabla de clientes. Las acciones las entrega la página (abren sus modales). */
export const getClientColumns = ({ onEdit, onDelete }: ClientColumnActions): TableColumn<Client>[] => [
  { key: "nombre", header: "Nombre", render: (c) => <span className="vc-pet-name">{c.nombre}</span> },
  { key: "rut", header: "RUT", render: (c) => c.rut },
  { key: "telefono", header: "Teléfono", render: (c) => c.telefono },
  { key: "correo", header: "Correo Electrónico", render: (c) => c.correo },
  {
    key: "mascotas",
    header: "Mascotas",
    render: (c) => <StatusBadge label={String(c.mascotas)} className="vc-badge-count" />,
  },
  {
    key: "acciones",
    header: "",
    render: (c) => (
      <div className="vc-row-actions">
        <IconButton label={`Editar a ${c.nombre}`} onClick={() => onEdit(c)}>
          <SquarePen size={16} />
        </IconButton>
        <IconButton label={`Eliminar a ${c.nombre}`} variant="danger" onClick={() => onDelete(c)}>
          <Trash2 size={16} />
        </IconButton>
      </div>
    ),
  },
];
