import { useState } from "react";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import SearchInput from "../../components/common/SearchInput";
import PetsTable from "../../components/tables/PetsTable";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { usePets } from "../../hooks/usePets";

const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 300;

/** Pantalla "Pacientes": listado de mascotas con búsqueda por mascota o dueño (FR-5). */
export default function PetsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const { pets, total, loading, error } = usePets({ search: debouncedSearch, page, pageSize: PAGE_SIZE });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="vc-dashboard">
      <PageHeader
        title="Pacientes"
        description="Mascotas registradas en la clínica y sus dueños."
        actions={
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar mascota, dueño o RUT..."
          />
        }
      />

      <Card>
        <PetsTable
          pets={pets}
          search={search}
          loading={loading}
          error={error}
          pagination={{ page, pageSize: PAGE_SIZE, total, itemLabel: "pacientes", onPageChange: setPage }}
        />
      </Card>
    </div>
  );
}
