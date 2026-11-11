import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import SearchInput from "../../components/common/SearchInput";
import Notice from "../../components/feedback/Notice";
import PageHeader from "../../components/common/PageHeader/PageHeader";
import PetsTable from "../../components/tables/PetsTable";
import { useFlashNotice } from "../../hooks/common/useFlashNotice";
import { usePermissions } from "../../hooks/auth/usePermissions";
import { usePets } from "../../hooks/pets/usePets";
import { useSearchPagination } from "../../hooks/common/useSearchPagination";
import "./Pets.css";
import { ROUTES } from "../../utils/navigation";

const PAGE_SIZE = 8;

/** Pantalla "Pacientes": mascotas agrupadas por dueño, con búsqueda por nombre o RUT del dueño (FR-5). */
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
              placeholder="Buscar dueño o RUT..."
            />
            {can("createPet") && (
              <Button variant="primary" onClick={() => navigate(ROUTES.petNew)}>
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
          onView={(pet) => navigate(`${ROUTES.pets}/${pet.id}`)}
          pagination={{ page, pageSize: PAGE_SIZE, total, itemLabel: "dueños", onPageChange: setPage }}
        />
      </Card>
    </div>
  );
}
