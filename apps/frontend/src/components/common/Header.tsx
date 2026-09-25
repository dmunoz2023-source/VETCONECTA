import { Search, Bell } from "lucide-react";

interface HeaderProps {
  userName?: string;
  role?: "vet" | "reception" | "admin";
}

const ROLE_LABEL: Record<string, string> = {
  vet: "Veterinario",
  reception: "Recepción",
  admin: "Administrador",
};

export default function Header({
  userName = "Dr. Admin Vet",
  role = "admin",
}: HeaderProps) {
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="vc-header">
      <div className="vc-search">
        <Search size={16} />
        <input type="text" placeholder="Buscar pacientes, clientes, fichas..." />
      </div>

      <div className="vc-header-actions">
        <Bell size={20} />
        <div className="vc-avatar">{initials}</div>
        <div className="vc-user-meta">
          <span>{userName}</span>
          <span>{ROLE_LABEL[role]}</span>
        </div>
      </div>
    </header>
  );
}
