import type { ReactNode } from "react";

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
}

export default function DataTable<T>({
  columns,
  rows,
  getRowKey,
  loading = false,
  error = null,
  emptyMessage = "No hay registros para mostrar.",
}: DataTableProps<T>) {
  const statusMessage = loading ? "Cargando..." : error ? error : rows.length === 0 ? emptyMessage : null;

  return (
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
                  <td key={col.key}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
