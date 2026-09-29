import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function FormField({ label, ...inputProps }: FormFieldProps) {
  return (
    <label>
      {label}
      <input {...inputProps} />
    </label>
  );
}
