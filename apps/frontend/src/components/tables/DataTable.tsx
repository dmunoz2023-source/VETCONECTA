import type { ReactNode } from "react";
import TablePagination, { type TablePaginationProps } from "./TablePagination";

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  /** When provided, the pagination is shown at the bottom of the table. */
  pagination?: TablePaginationProps;
}

/**
 * Message to show instead of the rows (null when there are rows to show).
 * Already loaded rows stay visible while a new query arrives.
 */
function getStatusMessage<T>(rows: T[], loading: boolean, error: string | null, emptyMessage: string) {
  if (error) return error;
  if (rows.length > 0) return null;
  if (loading) return "Cargando...";
  return emptyMessage;
}

// Column sorting: pending, add it here so every table inherits it.
export default function DataTable<T>({
  columns,
  rows,
  getRowKey,
  loading = false,
  error = null,
  emptyMessage = "No hay registros para mostrar.",
  pagination,
}: Readonly<DataTableProps<T>>) {
  const statusMessage = getStatusMessage(rows, loading, error, emptyMessage);

  return (
    <>
      <div className="vc-table-wrap">
        <table className="vc-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {statusMessage ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", color: "var(--vc-text-muted)" }}>
                  {statusMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={getRowKey(row)}>
                  {columns.map((col) => (
                    <td key={col.key}>{col.render(row)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && <TablePagination {...pagination} />}
    </>
  );
}
