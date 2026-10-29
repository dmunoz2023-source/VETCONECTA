import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

interface LoginFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'onChange'> {
  label: string;
  /** Mensaje de validación del campo; `null` si no hay error. */
  error: string | null;
  onChange: (value: string) => void;
}

/** Campo del formulario de login con etiqueta y mensaje de error accesible. */
export default function LoginField({ label, error, onChange, ...inputProps }: LoginFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
