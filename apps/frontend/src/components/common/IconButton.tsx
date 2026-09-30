import type { ButtonHTMLAttributes } from "react";
import "./IconButton.css";

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  /** Texto accesible (obligatorio: el botón solo tiene un icono). */
  label: string;
  /** "danger" resalta en rojo al pasar el mouse (acciones destructivas, p. ej. eliminar). */
  variant?: "default" | "danger";
}

export default function IconButton({ label, variant = "default", className = "", ...rest }: IconButtonProps) {
  const variantClass = variant === "danger" ? "vc-icon-btn-danger" : "";
  return (
    <button type="button" className={`vc-icon-btn ${variantClass} ${className}`.trim()} aria-label={label} {...rest} />
  );
}
