import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Mensaje de validación bajo el campo; `undefined` si no hay error. */
  error?: string;
}

export default function FormField({ label, error, ...inputProps }: FormFieldProps) {
  return (
    <label>
      {label}
      <input aria-invalid={error ? true : undefined} {...inputProps} />
      {error && <span className="vc-field-error">{error}</span>}
    </label>
  );
}
