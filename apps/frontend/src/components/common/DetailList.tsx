import type { ReactNode } from "react";

export interface DetailItem {
  label: string;
  value: ReactNode;
}

/** Lista de pares "etiqueta: valor" para fichas de solo lectura. */
export default function DetailList({ items }: { items: DetailItem[] }) {
  return (
    <dl className="vc-detail-list">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
