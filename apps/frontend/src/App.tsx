import { useState } from 'react';
import { logout } from './api/auth.api';
import type { Session } from './api/auth.api';
import Login from './pages/Login';

function App() {
  const [session, setSession] = useState<Session | null>(null);

  const handleLogout = () => {
    logout();
    setSession(null);
  };

  if (!session) return <Login onLoginSuccess={setSession} />;

  // Pantalla temporal: cuando se integre el router (D3/D4.1), aquí se navega a "/".
  return (
    <div>
      <p>Sesión iniciada como {session.role}.</p>
      <button type="button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default App;