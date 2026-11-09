import type { SelectHTMLAttributes } from "react";
import css from "./FormField.module.css";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  /** Text of the empty first option. */
  placeholder?: string;
  error?: string;
}

export default function SelectField({ label, options, placeholder = "Selecciona...", error, ...selectProps }: SelectFieldProps) {
  return (
    <label className={css.field}>
      {label}
      <select className={css.control} aria-invalid={error ? true : undefined} {...selectProps}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className={css.error}>{error}</span>}
    </label>
  );
}
