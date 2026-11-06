import type { InputHTMLAttributes } from "react";
import "./FormField.css";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Mensaje de validación bajo el campo; `undefined` si no hay error. */
  error?: string;
}

export default function FormField({ label, error, ...inputProps }: FormFieldProps) {
  return (
    <label className="vc-field">
      {label}
      <input aria-invalid={error ? true : undefined} {...inputProps} />
      {error && <span className="vc-field-error">{error}</span>}
    </label>
  );
}
