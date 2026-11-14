import { PawPrint } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import SearchInput from "../../components/common/SearchInput";
import Notice from "../../components/feedback/Notice";
import PageHeader from "../../components/common/PageHeader/PageHeader";
import PetsTable from "../../components/tables/PetsTable";
import { useFlashNotice } from "../../hooks/useFlashNotice";
import { usePermissions } from "../../hooks/usePermissions";
import { usePets } from "../../hooks/usePets";
import { useSearchPagination } from "../../hooks/useSearchPagination";
import css from "./PetsPage.module.css";
import { ROUTES } from "../../utils/navigation";

const PAGE_SIZE = 8;

/** "Pacientes" screen: pets grouped by owner, searchable by owner name or RUT (FR-5). */
export default function PetsPage() {
  const { search, debouncedSearch, page, setSearch, setPage } = useSearchPagination();
  const navigate = useNavigate();
  const can = usePermissions();
  const { notice, dismiss } = useFlashNotice();

  const { pets, total, loading, error } = usePets({ search: debouncedSearch, page, pageSize: PAGE_SIZE });

  return (
    <div className={css.page}>
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
                <PawPrint size={16} aria-hidden="true" /> Agregar mascota
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
