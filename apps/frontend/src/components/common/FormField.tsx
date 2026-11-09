import type { InputHTMLAttributes } from "react";
import css from "./FormField.module.css";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Validation message under the field; `undefined` when there is no error. */
  error?: string;
}

export default function FormField({ label, error, ...inputProps }: FormFieldProps) {
  return (
    <label className={css.field}>
      {label}
      <input className={css.control} aria-invalid={error ? true : undefined} {...inputProps} />
      {error && <span className={css.error}>{error}</span>}
    </label>
  );
}
