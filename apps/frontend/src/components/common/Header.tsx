import { Search, Bell } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { formatRole, getInitials } from "../../utils/formatters";

// Lee nombre y rol de la sesión (AuthContext)
export default function Header() {
  const { user } = useAuth();

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
            <div className="vc-avatar">{getInitials(user.name)}</div>
            <div className="vc-user-meta">
              <span>{user.name}</span>
              <span>{formatRole(user.role)}</span>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
