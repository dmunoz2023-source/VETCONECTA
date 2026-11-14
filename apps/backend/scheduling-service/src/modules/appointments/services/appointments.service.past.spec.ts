import { AppointmentsService } from './appointments.service';
import { AppointmentsRepository } from '../repositories/appointments.repository';
import { Appointment } from '../entities/appointment.entity';

const PET_ID = '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90';
const NOW = new Date('2026-11-12T12:00:00.000Z');

function appointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'a1111111-1111-4111-8111-111111111111',
    slotId: 's1111111-1111-4111-8111-111111111111',
    petId: PET_ID,
    clientId: 'c1111111-1111-4111-8111-111111111111',
    vetUserId: 'v1111111-1111-4111-8111-111111111111',
    specialtyId: 'p1111111-1111-4111-8111-111111111111',
    startTime: new Date('2026-10-01T14:00:00.000Z'),
    endTime: new Date('2026-10-01T14:30:00.000Z'),
    status: 'completed',
    channel: 'app',
    createdBy: 'u1111111-1111-4111-8111-111111111111',
    cancelledAt: null,
    ...overrides,
  } as Appointment;
}

describe('AppointmentsService.findPastByPet [F3]', () => {
  const repository = { findPastByPet: jest.fn() };
  let service: AppointmentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AppointmentsService(repository as unknown as AppointmentsRepository);
  });

  it('devuelve solo los campos que necesita clinical, sin datos internos', async () => {
    repository.findPastByPet.mockResolvedValue([appointment()]);

    const result = await service.findPastByPet({ petId: PET_ID }, NOW);

    expect(result.data).toHaveLength(1);
    expect(Object.keys(result.data[0]).sort()).toEqual(
      ['endTime', 'id', 'specialtyId', 'startTime', 'status', 'vetUserId'].sort(),
    );
  });

  it('conserva el estado de cada cita (completada, cancelada, no asistió)', async () => {
    repository.findPastByPet.mockResolvedValue([
      appointment({ id: 'a2', status: 'cancelled' }),
      appointment({ id: 'a3', status: 'no_show' }),
      appointment({ id: 'a4', status: 'completed' }),
    ]);

    const result = await service.findPastByPet({ petId: PET_ID }, NOW);

    expect(result.data.map((a) => a.status)).toEqual(['cancelled', 'no_show', 'completed']);
  });

  it('mantiene el orden que entrega el repositorio (más reciente primero)', async () => {
    repository.findPastByPet.mockResolvedValue([
      appointment({ id: 'nueva', startTime: new Date('2026-11-01T10:00:00.000Z') }),
      appointment({ id: 'vieja', startTime: new Date('2026-09-01T10:00:00.000Z') }),
    ]);

    const result = await service.findPastByPet({ petId: PET_ID }, NOW);

    expect(result.data.map((a) => a.id)).toEqual(['nueva', 'vieja']);
  });

  it('sin rango, pide al repositorio solo la mascota y el instante actual', async () => {
    repository.findPastByPet.mockResolvedValue([]);

    await service.findPastByPet({ petId: PET_ID }, NOW);

    expect(repository.findPastByPet).toHaveBeenCalledWith(PET_ID, {
      from: undefined,
      toExclusive: undefined,
      now: NOW,
    });
  });

  it('convierte from y to a fechas, con to exclusivo', async () => {
    repository.findPastByPet.mockResolvedValue([]);

    await service.findPastByPet(
      { petId: PET_ID, from: '2026-10-01T00:00:00Z', to: '2026-11-01T00:00:00Z' },
      NOW,
    );

    expect(repository.findPastByPet).toHaveBeenCalledWith(PET_ID, {
      from: new Date('2026-10-01T00:00:00Z'),
      toExclusive: new Date('2026-11-01T00:00:00Z'),
      now: NOW,
    });
  });

  it('una mascota sin citas pasadas devuelve la lista vacía', async () => {
    repository.findPastByPet.mockResolvedValue([]);

    await expect(service.findPastByPet({ petId: PET_ID }, NOW)).resolves.toEqual({ data: [] });
  });
});
