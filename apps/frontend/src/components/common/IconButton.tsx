import type { ButtonHTMLAttributes } from "react";
import "./IconButton.css";

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  /** Accessible text (required: the button only has an icon). */
  label: string;
  /** "danger" turns red on hover (destructive actions, e.g. delete). */
  variant?: "default" | "danger";
}

export default function IconButton({ label, variant = "default", className = "", ...rest }: IconButtonProps) {
  const variantClass = variant === "danger" ? "vc-icon-btn-danger" : "";
  return (
    <button type="button" className={`vc-icon-btn ${variantClass} ${className}`.trim()} aria-label={label} title={label} {...rest} />
  );
}
