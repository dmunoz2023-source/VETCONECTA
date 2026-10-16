import type { Pet } from "../../types/pet.types";
import { getPetColumns } from "./columns/petColumns";
import DataTable from "./DataTable";
import type { TablePaginationProps } from "./TablePagination";

interface PetsTableProps {
  pets: Pet[];
  search: string;
  loading: boolean;
  error: string | null;
  pagination: TablePaginationProps;
  onView: (pet: Pet) => void;
}

export default function PetsTable({ pets, search, loading, error, pagination, onView }: Readonly<PetsTableProps>) {
  return (
    <DataTable
      columns={getPetColumns({ onView })}
      rows={pets}
      getRowKey={(p) => p.id}
      loading={loading}
      error={error}
      emptyMessage={search ? `No se encontraron pacientes para "${search}".` : "No hay pacientes registrados."}
      pagination={pagination}
    />
  );
}
