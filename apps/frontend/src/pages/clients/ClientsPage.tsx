import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import SearchInput from "../../components/common/SearchInput";
import ConfirmDialog from "../../components/feedback/ConfirmDialog";
import ClientsTable from "../../components/tables/ClientsTable";
import { useClients } from "../../hooks/useClients";
import type { Client, ClientFormValues } from "../../types/client.types";
import ClientFormModal from "./ClientFormModal";
import "./ClientsPage.css";

const PAGE_SIZE = 8;

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);

  const { clients, total, loading, error } = useClients({ search, page, pageSize: PAGE_SIZE });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setModalOpen(true);
  };

  // TODO (API real): editing ? PATCH /v1/clients/{id} : POST /v1/clients con `values`;
  // al terminar, cerrar el modal y volver a pedir el listado.
  const handleSubmit = (values: ClientFormValues) => {
    void values;
    setModalOpen(false);
  };

  // TODO (API real): DELETE /v1/clients/{id} (baja lógica, según el SRS: "nunca borra físico");
  // al terminar, cerrar el diálogo y volver a pedir el listado.
  const handleConfirmDelete = () => {
    setDeleting(null);
  };

  return (
    <div className="vc-dashboard">
      <PageHeader
        title="Panel de Clientes"
        description="Gestiona y administra la información de los dueños de mascotas."
        actions={
          <>
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder="Buscar clientes, rut, teléfono..."
            />
            <Button variant="primary" onClick={openNew}>
              <Plus size={16} /> Nuevo Cliente
            </Button>
          </>
        }
      />

      <Card>
        <ClientsTable
          clients={clients}
          search={search}
          loading={loading}
          error={error}
          onEdit={openEdit}
          onDelete={setDeleting}
          pagination={{ page, pageSize: PAGE_SIZE, total, itemLabel: "clientes", onPageChange: setPage }}
        />
      </Card>

      {modalOpen && (
        <ClientFormModal client={editing} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />
      )}

      {deleting && (
        <ConfirmDialog
          title="Eliminar cliente"
          message={`¿Eliminar a ${deleting.nombre}? Esta acción no se puede deshacer.`}
          onCancel={() => setDeleting(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
