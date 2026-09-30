import type { Role } from "../types/auth.types";

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
