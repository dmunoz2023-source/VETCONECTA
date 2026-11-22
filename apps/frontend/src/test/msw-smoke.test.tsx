import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Configuración de entorno Frontend (RTL + MSW)', () => {
  it('debe renderizar componentes en jsdom correctamente', () => {
    render(<button type="button">Guardar mascota</button>);
    expect(screen.getByRole('button', { name: 'Guardar mascota' })).toBeInTheDocument();
  });

  it('debe interceptar peticiones HTTP con MSW', async () => {
    const response = await fetch('http://localhost:3000/v1/pets');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('name', 'Polo');
  });
});