import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import SearchInput from "../../components/common/SearchInput";
import Notice from "../../components/feedback/Notice";
import PetsTable from "../../components/tables/PetsTable";
import { useFlashNotice } from "../../hooks/useFlashNotice";
import { usePermissions } from "../../hooks/usePermissions";
import { usePets } from "../../hooks/usePets";
import { useSearchPagination } from "../../hooks/useSearchPagination";
import "./Pets.css";

const PAGE_SIZE = 8;

/** Pantalla "Pacientes": listado de mascotas con búsqueda por mascota o dueño (FR-5). */
export default function PetsPage() {
  const { search, debouncedSearch, page, setSearch, setPage } = useSearchPagination();
  const navigate = useNavigate();
  const can = usePermissions();
  const { notice, dismiss } = useFlashNotice();

  const { pets, total, loading, error } = usePets({ search: debouncedSearch, page, pageSize: PAGE_SIZE });

  return (
    <div className="vc-dashboard">
      <PageHeader
        title="Pacientes"
        description="Mascotas registradas en la clínica y sus dueños."
        actions={
          <>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar mascota, dueño o RUT..."
            />
            {can("createPet") && (
              <Button variant="primary" onClick={() => navigate("/mascotas/nueva")}>
                <Plus size={16} /> Nueva mascota
              </Button>
            )}
          </>
        }
      />

      {notice && <Notice message={notice} onDismiss={dismiss} />}

      <Card>
        <PetsTable
          pets={pets}
          search={search}
          loading={loading}
          error={error}
          onView={(pet) => navigate(`/mascotas/${pet.id}`)}
          pagination={{ page, pageSize: PAGE_SIZE, total, itemLabel: "pacientes", onPageChange: setPage }}
        />
      </Card>
    </div>
  );
}
