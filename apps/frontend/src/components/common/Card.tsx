import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export default function Card({ title, subtitle, actions, className = "", children }: CardProps) {
  return (
    <section className={`vc-card ${className}`.trim()}>
      {(title || actions) && (
        <div className="vc-card-header-row">
          <div>
            {title && <h2 className="vc-card-title">{title}</h2>}
            {subtitle && <p className="vc-card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="vc-card-icons">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
