import { useId } from "react";
import type { LucideIcon } from "lucide-react";
import css from "./OptionCards.module.css";

export interface OptionCard {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface OptionCardsProps {
  label: string;
  options: OptionCard[];
  value: string;
  onChange: (value: string) => void;
  /** Validation message under the options; `undefined` when there is no error. */
  error?: string;
}

/** Single choice shown as clickable cards (radio buttons underneath, so the keyboard works). */
export default function OptionCards({ label, options, value, onChange, error }: OptionCardsProps) {
  const name = useId();

  return (
    <div className={css.group} role="radiogroup" aria-label={label}>
      <span className={css.label}>{label}</span>
      <div className={css.options}>
        {options.map(({ value: optionValue, label: optionLabel, icon: Icon }) => (
          <label key={optionValue} className={css.option}>
            <input
              type="radio"
              name={name}
              className={css.input}
              value={optionValue}
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
            />
            <span className={css.card}>
              {Icon && <Icon size={20} aria-hidden="true" />}
              {optionLabel}
            </span>
          </label>
        ))}
      </div>
      {error && <span className={css.error}>{error}</span>}
    </div>
  );
}
