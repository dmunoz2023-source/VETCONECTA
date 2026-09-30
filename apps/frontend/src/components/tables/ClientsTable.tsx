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
}

export default function ClientsTable({
  clients,
  search,
  loading,
  error,
  pagination,
  onEdit,
  onDelete,
}: Readonly<ClientsTableProps>) {
  return (
    <DataTable
      columns={getClientColumns({ onEdit, onDelete })}
      rows={clients}
      getRowKey={(c) => c.rut}
      loading={loading}
      error={error}
      emptyMessage={search ? `No se encontraron clientes para "${search}".` : "No hay clientes registrados."}
      pagination={pagination}
    />
  );
}
