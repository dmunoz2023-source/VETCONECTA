import type { ReactNode } from "react";

import css from './PageHeader.module.css'

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className={css.vc_dash_header}>
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className={css.vc_dash_actions}>{actions}</div>}
    </div>
  );
}
