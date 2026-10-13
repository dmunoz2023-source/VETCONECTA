import type { AuthUser } from '../../types/auth.types';
import LoginForm from './LoginForm';
import './Login.css';

interface LoginProps {
  /** Se llama cuando el inicio de sesión fue correcto. Quien la use decide adónde ir. */
  onLoginSuccess: (user: AuthUser) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="brand-logo">
          <span className="logo-icon">❤️🐶</span>
          <span className="logo-text">VetConecta</span>
        </div>

        <div className="login-header">
          <h2>Panel de Control</h2>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <LoginForm onSuccess={onLoginSuccess} />

        <p className="login-help">
          ¿Problemas para ingresar? Contacta al administrador de tu clínica.
        </p>
      </div>

      <p className="login-copy">© VetConecta · Gestión clínica veterinaria</p>
    </div>
  );
}
