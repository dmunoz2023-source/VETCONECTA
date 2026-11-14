import type { ReactNode } from "react";
import css from "./DetailList.module.css";

export interface DetailItem {
  label: string;
  value: ReactNode;
}

/** List of "label: value" pairs for read-only record views. */
export default function DetailList({ items }: { items: DetailItem[] }) {
  return (
    <dl className={css.list}>
      {items.map(({ label, value }) => (
        <div key={label} className={css.item}>
          <dt className={css.label}>{label}</dt>
          <dd className={css.value}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
