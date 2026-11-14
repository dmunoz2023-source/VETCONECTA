import type { ReactNode } from "react";
import css from "./FormSection.module.css";

interface FormSectionProps {
  step: number;
  title: string;
  subtitle?: string;
  /** Tinted panel with a colored top border, for the section that holds the main data. */
  panel?: boolean;
  children: ReactNode;
}

/** Numbered form section: a step badge, a title, an optional hint and the fields. */
export default function FormSection({ step, title, subtitle, panel = false, children }: FormSectionProps) {
  return (
    <section className={`${css.section} ${panel ? css.panel : ""}`.trim()}>
      <header className={css.header}>
        <span className={css.step} aria-hidden="true">
          {step}
        </span>
        <div>
          <h3 className={css.title}>{title}</h3>
          {subtitle && <p className={css.subtitle}>{subtitle}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}
