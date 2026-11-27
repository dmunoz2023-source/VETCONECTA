import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AgendPage from './AgendPage';

describe('AgendPage (Visualización de citas y filtros)', () => {
  const renderAgenda = () => {
    return render(
      <MemoryRouter>
        <AgendPage />
      </MemoryRouter>
    );
  };

  it('debe renderizar las citas obtenidas desde MSW en la agenda', async () => {
    renderAgenda();

    expect(await screen.findByText(/Perlita/i)).toBeInTheDocument();
    expect(await screen.findByText(/Simba/i)).toBeInTheDocument();
  });

  it('debe filtrar las citas mostradas al seleccionar un estado en los filtros', async () => {
    const user = userEvent.setup();
    renderAgenda();

    await screen.findByText(/Perlita/i);

    const statusFilter = screen.getByDisplayValue('Todos los Estados');
    await user.selectOptions(statusFilter, 'confirmada');

    await waitFor(() => {
      expect(screen.getByText(/Perlita/i)).toBeInTheDocument();
      expect(screen.queryByText(/Simba/i)).not.toBeInTheDocument();
    });
  });

  it('debe filtrar las citas por veterinario seleccionado', async () => {
    const user = userEvent.setup();
    renderAgenda();

    await screen.findByText(/Simba/i);

    const vetFilter = screen.getByDisplayValue('Todos los Veterinarios');
    await user.selectOptions(vetFilter, 'v2');

    await waitFor(() => {
      expect(screen.getByText(/Simba/i)).toBeInTheDocument();
      expect(screen.queryByText(/Perlita/i)).not.toBeInTheDocument();
    });
  });

  it('debe filtrar las citas mediante el buscador de texto', async () => {
    const user = userEvent.setup();
    renderAgenda();

    await screen.findByText(/Perlita/i);

    const searchInput = screen.getByPlaceholderText(/buscar paciente/i);
    await user.type(searchInput, 'Simba');

    await waitFor(() => {
      expect(screen.getByText(/Simba/i)).toBeInTheDocument();
      expect(screen.queryByText(/Perlita/i)).not.toBeInTheDocument();
    });
  });
});