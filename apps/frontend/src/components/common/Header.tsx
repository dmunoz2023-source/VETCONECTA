import { Search, Bell, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { formatRole, getInitials } from "../../utils/formatters";
import IconButton from "./IconButton";

// Lee correo y rol de la sesión activa (AuthContext)
export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="vc-header">
      <div className="vc-search">
        <Search size={16} />
        <input type="text" placeholder="Buscar pacientes, clientes, fichas..." />
      </div>

      <div className="vc-header-actions">
        <Bell size={20} />
        {user && (
          <>
            <div className="vc-avatar">{getInitials(user.email)}</div>
            <div className="vc-user-meta">
              <span>{user.email}</span>
              <span>{formatRole(user.role)}</span>
            </div>
            <IconButton label="Cerrar sesión" onClick={logout}>
              <LogOut size={18} />
            </IconButton>
          </>
        )}
      </div>
    </header>
  );
}
