import { useLoginForm } from '../../hooks/useLoginForm';
import type { AuthUser } from '../../types/auth.types';
import LoginField from './LoginField';

interface LoginFormProps {
  /** Se llama cuando el inicio de sesión fue correcto. */
  onSuccess: (user: AuthUser) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { values, error, submitting, fieldError, setValue, markTouched, handleSubmit } = useLoginForm(onSuccess);

  return (
    <form onSubmit={handleSubmit} className="login-form" noValidate>
      {error && (
        <p className="login-error" role="alert">
          {error}
        </p>
      )}

      <LoginField
        label="Email"
        type="email"
        autoComplete="username"
        placeholder="veterinario@clinica.cl"
        value={values.email}
        error={fieldError('email')}
        onChange={(value) => setValue('email', value)}
        onBlur={() => markTouched('email')}
      />

      <LoginField
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={values.password}
        error={fieldError('password')}
        onChange={(value) => setValue('password', value)}
        onBlur={() => markTouched('password')}
      />

      <button type="submit" className="login-btn" disabled={submitting}>
        {submitting ? 'Ingresando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}
