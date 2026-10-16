import type { Client } from "../../types/client.types";
import { getClientColumns } from "./columns/clientColumns";
import DataTable from "./DataTable";
import type { TablePaginationProps } from "./TablePagination";

interface ClientsTableProps {
  clients: Client[];
  search: string;
  loading: boolean;
  error: string | null;
  pagination: TablePaginationProps;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onAddPet?: (client: Client) => void;
}

export default function ClientsTable({
  clients,
  search,
  loading,
  error,
  pagination,
  onEdit,
  onDelete,
  onAddPet,
}: Readonly<ClientsTableProps>) {
  return (
    <DataTable
      columns={getClientColumns({ onEdit, onDelete, onAddPet })}
      rows={clients}
      getRowKey={(c) => c.id}
      loading={loading}
      error={error}
      emptyMessage={search ? `No se encontraron clientes para "${search}".` : "No hay clientes registrados."}
      pagination={pagination}
    />
  );
}
