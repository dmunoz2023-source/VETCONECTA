import type { Role } from "../types/auth.types";
import { parseDateOnly } from "./age";

const ROLE_LABELS: Record<Role, string> = {
  vet: "Veterinario",
  reception: "Recepción",
  admin: "Administrador",
};

export const formatRole = (role: Role): string => ROLE_LABELS[role];

export const getInitials = (fullName: string, max = 2): string =>
  fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, max)
    .join("")
    .toUpperCase();

/** "AAAA-MM-DD" (formato ISO de la API) → fecha local legible, p. ej. "10-05-2025". */
export const formatDate = (isoDate: string | null): string => {
  const date = isoDate ? parseDateOnly(isoDate) : null;
  return date ? date.toLocaleDateString("es-CL") : "—";
};
