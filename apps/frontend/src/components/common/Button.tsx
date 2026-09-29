import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary";
}

export default function Button({ variant = "default", className = "", ...rest }: ButtonProps) {
  const variantClass = variant === "primary" ? "primary" : "";
  return <button className={`vc-btn ${variantClass} ${className}`.trim()} {...rest} />;
}
