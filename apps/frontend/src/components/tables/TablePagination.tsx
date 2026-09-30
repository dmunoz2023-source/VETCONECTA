import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPageRange, getTotalPages } from "../../utils/pagination";
import IconButton from "../common/IconButton";

export interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  /** Nombre de lo que se lista, para el texto "Mostrados 1-8 de 9 {itemLabel}". */
  itemLabel?: string;
  onPageChange: (page: number) => void;
}

export default function TablePagination({
  page,
  pageSize,
  total,
  itemLabel = "registros",
  onPageChange,
}: Readonly<TablePaginationProps>) {
  const totalPages = getTotalPages(total, pageSize);
  const { from, to } = getPageRange(page, pageSize, total);

  const goToPage = (target: number) => {
    if (target < 1 || target > totalPages) return;
    onPageChange(target);
  };

  return (
    <div className="vc-pagination">
      <span>
        Mostrados {from}-{to} de {total} {itemLabel}
      </span>
      <div className="vc-pagination-controls">
        <IconButton label="Página anterior" onClick={() => goToPage(page - 1)} disabled={page === 1}>
          <ChevronLeft size={16} />
        </IconButton>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            className={`vc-page-btn ${p === page ? "active" : ""}`}
            onClick={() => goToPage(p)}
          >
            {p}
          </button>
        ))}
        <IconButton label="Página siguiente" onClick={() => goToPage(page + 1)} disabled={page === totalPages}>
          <ChevronRight size={16} />
        </IconButton>
      </div>
    </div>
  );
}
