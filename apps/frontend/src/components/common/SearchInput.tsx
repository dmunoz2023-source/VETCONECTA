import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: string;
  onChange: (value: string) => void;
}

/** Buscador con icono. Acepta atributos extra del input (p. ej. `aria-labelledby`). */
export default function SearchInput({ value, onChange, placeholder = "Buscar...", ...inputProps }: SearchInputProps) {
  return (
    <div className="vc-clients-search">
      <Search size={16} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...inputProps}
      />
    </div>
  );
}
