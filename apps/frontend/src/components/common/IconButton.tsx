import type { ButtonHTMLAttributes } from "react";
import "./IconButton.css";

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  /** Accessible text (required: the button only has an icon). */
  label: string;
  /** "danger" turns red on hover (destructive actions, e.g. delete). */
  variant?: "default" | "danger";
  /** Short visible text next to the icon, for actions that are not obvious from the icon alone. */
  text?: string;
}

export default function IconButton({ label, variant = "default", text, className = "", children, ...rest }: IconButtonProps) {
  const variantClass = variant === "danger" ? "vc-icon-btn-danger" : "";
  const textClass = text ? "vc-icon-btn-text" : "";
  return (
    <button
      type="button"
      className={`vc-icon-btn ${variantClass} ${textClass} ${className}`.trim()}
      aria-label={label}
      title={label}
      {...rest}
    >
      {children}
      {text}
    </button>
  );
}
