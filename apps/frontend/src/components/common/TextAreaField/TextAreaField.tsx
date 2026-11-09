import type { TextareaHTMLAttributes } from "react";
import "./FormField.css";

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  /** Mensaje de validación bajo el campo; `undefined` si no hay error. */
  error?: string;
}

/** Igual que FormField, pero para textos largos (observaciones, notas). */
export default function TextAreaField({ label, error, rows = 4, ...textareaProps }: TextAreaFieldProps) {
  return (
    <label className="vc-field">
      {label}
      <textarea rows={rows} aria-invalid={error ? true : undefined} {...textareaProps} />
      {error && <span className="vc-field-error">{error}</span>}
    </label>
  );
}
