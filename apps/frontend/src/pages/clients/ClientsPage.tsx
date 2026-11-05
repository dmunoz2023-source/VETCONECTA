import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import SearchInput from "../../components/common/SearchInput";
import ConfirmDialog from "../../components/feedback/ConfirmDialog";
import ClientsTable from "../../components/tables/ClientsTable";
import { useClientDialogs } from "../../hooks/useClientDialogs";
import { useClients } from "../../hooks/useClients";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import ClientFormModal from "./ClientFormModal";
import "./ClientsPage.css";

const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 300;

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  // Espera a que el usuario deje de escribir antes de consultar la API.
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const { clients, total, loading, error, saveClient, removeClient } = useClients({
    search: debouncedSearch,
    page,
    pageSize: PAGE_SIZE,
  });
  const { form, remove, error: dialogError } = useClientDialogs({ saveClient, removeClient });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
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
