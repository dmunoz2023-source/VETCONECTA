import type { TextareaHTMLAttributes } from "react";
import css from "./TextAreaField.module.css";

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  /** Validation message under the field; `undefined` when there is no error. */
  error?: string;
}

/** Multi-line text field (notes, observations) with its label and error message. */
export default function TextAreaField({ label, error, rows = 4, ...textareaProps }: TextAreaFieldProps) {
  return (
    <label className={css.field}>
      {label}
      <textarea className={css.textarea} rows={rows} aria-invalid={error ? true : undefined} {...textareaProps} />
      {error && <span className={css.error}>{error}</span>}
    </label>
  );
}
