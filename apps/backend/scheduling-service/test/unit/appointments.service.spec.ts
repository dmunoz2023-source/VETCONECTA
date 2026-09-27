import { ForbiddenException } from '@nestjs/common';
import { AppointmentsService } from '../../src/modules/appointments/services/appointments.service';
import { AppointmentsRepository } from '../../src/modules/appointments/repositories/appointments.repository';

describe('AppointmentsService.findMyCitas', () => {
  const repoMock = {
    findByClient: jest.fn(),
  } as unknown as jest.Mocked<AppointmentsRepository>;

  const service = new AppointmentsService(repoMock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza si el usuario no tiene client_id (BR-8)', async () => {
    await expect(
      service.findMyCitas(undefined, { page: 1, limit: 10 }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repoMock.findByClient).not.toHaveBeenCalled();
  });

  it('delega en el repositorio y arma la metadata de paginacion', async () => {
    (repoMock.findByClient as jest.Mock).mockResolvedValue([[{ id: 'a' }, { id: 'b' }], 2]);

    const result = await service.findMyCitas('client-1', {
      estado: ['reservada'],
      page: 1,
      limit: 2,
    });

    expect(repoMock.findByClient).toHaveBeenCalledWith('client-1', {
      estado: ['reservada'],
      page: 1,
      limit: 2,
    });
    expect(result).toEqual({
      data: [{ id: 'a' }, { id: 'b' }],
      meta: { total: 2, page: 1, limit: 2, totalPages: 1 },
    });
  });
});
