import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { login, LoginError } from '../../api/auth.api';
import type { Session } from '../../api/auth.api';
import './Login.css';

interface LoginProps {
  /** Se llama cuando el inicio de sesión fue correcto. Quien la use decide adónde ir. */
  onLoginSuccess: (session: Session) => void;
}

const UNEXPECTED_ERROR = 'Ocurrió un error inesperado. Intenta nuevamente.';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return 'Ingresa tu correo.';
  return EMAIL_PATTERN.test(email) ? null : 'Ingresa un correo válido.';
}

function validatePassword(value: string): string | null {
  return value ? null : 'Ingresa tu contraseña.';
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Los errores se calculan al vuelo y solo se muestran en campos que el usuario ya visitó.
  const emailError = emailTouched ? validateEmail(email) : null;
  const passwordError = passwordTouched ? validatePassword(password) : null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    if (validateEmail(email) || validatePassword(password)) return;

    setLoading(true);
    setError(null);

    try {
      const session = await login(email.trim(), password);
      onLoginSuccess(session);
    } catch (err: unknown) {
      setError(err instanceof LoginError ? err.message : UNEXPECTED_ERROR);
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Recreación del logo de la esquina superior izquierda */}
        <div className="brand-logo">
          <span className="logo-icon">❤️🐶</span>
          <span className="logo-text">VetConecta</span>
        </div>

        <div className="login-header">
          <h2>Panel de Control</h2>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <div className="form-group">
            <label htmlFor={emailId}>Email</label>
            <input
              id={emailId}
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="veterinario@clinica.cl"
              aria-invalid={emailError ? true : undefined}
              aria-describedby={emailError ? `${emailId}-error` : undefined}
            />
            {emailError && (
              <p className="field-error" id={`${emailId}-error`}>
                {emailError}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor={passwordId}>Contraseña</label>
            <input
              id={passwordId}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              placeholder="••••••••"
              aria-invalid={passwordError ? true : undefined}
              aria-describedby={passwordError ? `${passwordId}-error` : undefined}
            />
            {passwordError && (
              <p className="field-error" id={`${passwordId}-error`}>
                {passwordError}
              </p>
            )}
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="login-help">
          ¿Problemas para ingresar? Contacta al administrador de tu clínica.
        </p>
      </div>

      <p className="login-copy">© VetConecta · Gestión clínica veterinaria</p>
    </div>
  );
}