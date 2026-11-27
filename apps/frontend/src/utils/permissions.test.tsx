import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

type ClinicalRole = 'vet' | 'reception' | 'admin';

interface RoleActionsPanelProps {
  role: ClinicalRole;
}

const ROLE_CAPABILITIES: Record<ClinicalRole, string[]> = {
  vet: ['clinical:create', 'appointment:complete', 'pet:view'],
  reception: ['appointment:create', 'appointment:cancel', 'client:create', 'pet:create'],
  admin: [
    'clinical:create',
    'appointment:complete',
    'appointment:create',
    'appointment:cancel',
    'client:create',
    'pet:create',
    'staff:manage',
  ],
};

function hasPermission(role: ClinicalRole, action: string): boolean {
  return ROLE_CAPABILITIES[role].includes(action);
}

function ClinicalActionsToolbar({ role }: RoleActionsPanelProps) {
  return (
    <div>
      {hasPermission(role, 'clinical:create') && (
        <button type="button">Registrar atención clínica</button>
      )}
      {hasPermission(role, 'appointment:complete') && (
        <button type="button">Marcar cita realizada</button>
      )}
      {hasPermission(role, 'appointment:create') && (
        <button type="button">Nueva reserva telefónica</button>
      )}
      {hasPermission(role, 'client:create') && (
        <button type="button">Nuevo cliente</button>
      )}
      {hasPermission(role, 'staff:manage') && (
        <button type="button">Gestionar personal</button>
      )}
    </div>
  );
}

describe('Control de acciones según rol (RBAC / BR-14)', () => {
  it('debe mostrar acciones médicas al rol vet y ocultar acciones exclusivas de recepción o admin', () => {
    render(<ClinicalActionsToolbar role="vet" />);

    expect(
      screen.getByRole('button', { name: /registrar atención clínica/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /marcar cita realizada/i })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: /nueva reserva telefónica/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /gestionar personal/i })
    ).not.toBeInTheDocument();
  });

  it('debe mostrar acciones de agenda y clientes al rol reception y ocultar registro clínico', () => {
    render(<ClinicalActionsToolbar role="reception" />);

    expect(
      screen.getByRole('button', { name: /nueva reserva telefónica/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /nuevo cliente/i })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: /registrar atención clínica/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /gestionar personal/i })
    ).not.toBeInTheDocument();
  });

  it('debe habilitar todas las acciones administrativas y operativas para el rol admin', () => {
    render(<ClinicalActionsToolbar role="admin" />);

    expect(
      screen.getByRole('button', { name: /registrar atención clínica/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /nueva reserva telefónica/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /gestionar personal/i })
    ).toBeInTheDocument();
  });
});