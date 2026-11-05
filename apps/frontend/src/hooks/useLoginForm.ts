import { useState } from 'react';
import type { FormEvent } from 'react';
import { LoginError } from '../api/auth.api';
import type { AuthUser } from '../types/auth.types';
import { validateEmail, validatePassword } from '../utils/validators';
import { useAuth } from './useAuth';

type LoginField = 'email' | 'password';

const UNEXPECTED_ERROR = 'Ocurrió un error inesperado. Intenta nuevamente.';

const VALIDATORS: Record<LoginField, (value: string) => string | null> = {
  email: validateEmail,
  password: validatePassword,
};

/**
 * Estado y envío del formulario de login: valores, validación en tiempo real
 * (solo en campos ya visitados) y conexión con la sesión (useAuth().login).
 */
export function useLoginForm(onSuccess: (user: AuthUser) => void) {
  const { login } = useAuth();
  const [values, setValues] = useState<Record<LoginField, string>>({ email: '', password: '' });
  const [touched, setTouched] = useState<Record<LoginField, boolean>>({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldError = (field: LoginField) => (touched[field] ? VALIDATORS[field](values[field]) : null);

  const setValue = (field: LoginField, value: string) => setValues((prev) => ({ ...prev, [field]: value }));

  const markTouched = (field: LoginField) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ email: true, password: true });
    if (validateEmail(values.email) || validatePassword(values.password)) return;

    setSubmitting(true);
    setError(null);
    try {
      const user = await login({ identifier: values.email, password: values.password });
      onSuccess(user);
    } catch (err: unknown) {
      setError(err instanceof LoginError ? err.message : UNEXPECTED_ERROR);
      setSubmitting(false);
    }
  };

  return { values, error, submitting, fieldError, setValue, markTouched, handleSubmit };
}
