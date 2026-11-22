import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Login from './Login';

describe('Login (Panel Web Clínico)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderLogin = () => {
    return render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Login onLoginSuccess={()=> {}}/>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('debe mostrar errores de validación cuando se envía el formulario vacío', async () => {
    const user = userEvent.setup();
    renderLogin();

    const submitButton = screen.getByRole('button', { name: /ingresar|iniciar sesión/i });
    await user.click(submitButton);

    const alerts = await screen.findAllByText(/obligatorio|requerido|inválido|ingresa/i);
    expect(alerts.length).toBeGreaterThan(0);
  });

  it('debe mostrar mensaje de error cuando MSW responde 401 por credenciales inválidas', async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByLabelText(/email|correo|usuario|identificador/i);
    const passwordInput = screen.getByLabelText(/contraseña|password|clave/i);
    const submitButton = screen.getByRole('button', { name: /ingresar|iniciar sesión/i });

    await user.type(emailInput, 'error@vetconecta.cl');
    await user.type(passwordInput, 'ClaveIncorrecta123');
    await user.click(submitButton);

    expect(
      await screen.findByText(/credenciales inválidas|correo o contraseña incorrectos/i)
    ).toBeInTheDocument();
  });

  it('debe rechazar el ingreso si el rol del usuario es owner (BR-14)', async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByLabelText(/email|correo|usuario|identificador/i);
    const passwordInput = screen.getByLabelText(/contraseña|password|clave/i);
    const submitButton = screen.getByRole('button', { name: /ingresar|iniciar sesión/i });

    await user.type(emailInput, 'owner@vetconecta.cl');
    await user.type(passwordInput, 'ClaveValida123');
    await user.click(submitButton);

    expect(
      await screen.findByText(/esta cuenta no tiene acceso al panel clínico/i)
    ).toBeInTheDocument();
    expect(localStorage.getItem('jwt_token')).toBeNull();
  });

  it('debe autenticar correctamente a un veterinario y guardar el JWT en localStorage', async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByLabelText(/email|correo|usuario|identificador/i);
    const passwordInput = screen.getByLabelText(/contraseña|password|clave/i);
    const submitButton = screen.getByRole('button', { name: /ingresar|iniciar sesión/i });

    await user.type(emailInput, 'vet@vetconecta.cl');
    await user.type(passwordInput, 'ClaveValida123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem('jwt_token')).toBeTruthy();
    });
  });
});