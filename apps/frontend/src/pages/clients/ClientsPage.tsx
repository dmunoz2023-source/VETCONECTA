import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import SearchInput from "../../components/common/SearchInput";
import ConfirmDialog from "../../components/feedback/ConfirmDialog";
import ClientsTable from "../../components/tables/ClientsTable";
import { getErrorMessage } from "../../api/axios";
import { useClients } from "../../hooks/useClients";
import type { Client, ClientFormValues } from "../../types/client.types";
import ClientFormModal from "./ClientFormModal";
import "./ClientsPage.css";

const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 300;

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);

  // Espera a que el usuario deje de escribir antes de consultar la API.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const { clients, total, loading, error, saveClient } = useClients({
    search: debouncedSearch,
    page,
    pageSize: PAGE_SIZE,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const openNew = () => {
    setEditing(null);
    setSaveError(null);
    setModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setSaveError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSaveError(null);
  };

  // POST /v1/clients al crear, PATCH al editar. Si la API responde con error, el modal
  // queda abierto y muestra el mensaje del servidor (por ejemplo 409 si el RUT ya existe).
  // TODO: confirmar con el Scrum qué identifica al cliente en PATCH /v1/clients/{...}
  // al no usar `id`; por ahora se envía el RUT.
  const handleSubmit = async (values: ClientFormValues) => {
    setSaveError(null);
    try {
      await saveClient(values, editing?.rut);
      closeModal();
    } catch (err: unknown) {
      setSaveError(getErrorMessage(err, "No se pudo guardar el cliente."));
    }
  };

  // TODO (API real): DELETE /v1/clients/{id} (baja lógica, según el SRS: "nunca borra físico");
  // al terminar, cerrar el diálogo y volver a pedir el listado.
  const handleConfirmDelete = async () => { 
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
        <ClientFormModal client={editing} error={saveError} onClose={closeModal} onSubmit={handleSubmit} />
      )}

      {deleting && (
        <ConfirmDialog
          title="Eliminar cliente"
          message={`¿Eliminar a ${deleting.first_name} ${deleting.last_name}? Esta acción no se puede deshacer.`}
          onCancel={() => setDeleting(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
