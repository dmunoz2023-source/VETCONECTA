import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import SearchInput from "../../components/common/SearchInput";
import ConfirmDialog from "../../components/feedback/ConfirmDialog";
import ClientsTable from "../../components/tables/ClientsTable";
import { useClientDialogs } from "../../hooks/useClientDialogs";
import { useClients } from "../../hooks/useClients";
import { usePermissions } from "../../hooks/usePermissions";
import { useSearchPagination } from "../../hooks/useSearchPagination";
import type { Client } from "../../types/client.types";
import ClientFormModal from "./ClientFormModal";
import "./ClientsPage.css";

const PAGE_SIZE = 8;

export default function ClientsPage() {
  const { search, debouncedSearch, page, setSearch, setPage } = useSearchPagination();

  const { clients, total, loading, error, saveClient, removeClient } = useClients({
    search: debouncedSearch,
    page,
    pageSize: PAGE_SIZE,
  });
  const { form, remove, error: dialogError } = useClientDialogs({ saveClient, removeClient });
  const navigate = useNavigate();
  const can = usePermissions();

  // Abre el alta de mascota con este cliente ya elegido como dueño (UC-05, paso 2).
  const handleAddPet = (client: Client) => navigate(`/mascotas/nueva?clientId=${client.id}`);

  return (
    <div className="vc-dashboard">
      <PageHeader
        title="Panel de Clientes"
        description="Gestiona y administra la información de los dueños de mascotas."
        actions={
          <>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar clientes, rut, teléfono..."
            />
            <Button variant="primary" onClick={form.openNew}>
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
          onEdit={form.openEdit}
          onDelete={remove.ask}
          onAddPet={can("createPet") ? handleAddPet : undefined}
          pagination={{ page, pageSize: PAGE_SIZE, total, itemLabel: "clientes", onPageChange: setPage }}
        />
      </Card>

      {form.open && (
        <ClientFormModal client={form.client} error={dialogError} onClose={form.close} onSubmit={form.submit} />
      )}

      {remove.client && (
        <ConfirmDialog
          title="Eliminar cliente"
          message={`¿Dar de baja a ${remove.client.firstName} ${remove.client.lastName}? Dejará de aparecer en el directorio.`}
          error={dialogError}
          onCancel={remove.cancel}
          onConfirm={remove.confirm}
        />
      )}
    </div>
  );
}
