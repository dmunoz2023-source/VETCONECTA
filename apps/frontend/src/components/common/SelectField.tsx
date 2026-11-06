import type { SelectHTMLAttributes } from "react";
import "./FormField.css";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  /** Texto de la opción vacía inicial. */
  placeholder?: string;
  error?: string;
}

export default function SelectField({ label, options, placeholder = "Selecciona...", error, ...selectProps }: SelectFieldProps) {
  return (
    <label className="vc-field">
      {label}
      <select aria-invalid={error ? true : undefined} {...selectProps}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="vc-field-error">{error}</span>}
    </label>
  );
}
