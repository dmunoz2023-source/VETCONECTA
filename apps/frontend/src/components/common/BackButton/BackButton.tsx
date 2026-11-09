import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import css from "./BackButton.module.css";

interface BackButtonProps {
  /** Explicit destination: `navigate(-1)` would break after a redirect with a flash notice. */
  to: string;
  label?: string;
}

/** Link-style "back" button shown above the page header. */
export default function BackButton({ to, label = "Volver" }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button type="button" className={css.backButton} onClick={() => navigate(to)}>
      <ArrowLeft size={16} aria-hidden="true" />
      {label}
    </button>
  );
}
