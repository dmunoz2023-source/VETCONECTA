import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { InternalKeyGuard } from '@app/shared/guards/internal-key.guard';
import { InternalAppointmentsController } from './internal-appointments.controller';
import { AppointmentsService } from '../modules/appointments/services/appointments.service';

// libs/shared se resuelve contra el @nestjs/common de la raíz (v12, ESM) y jest no puede
// cargarlo; el guard se sustituye por una clase vacía y aquí solo se comprueba que se aplica.
jest.mock('@app/shared/guards/internal-key.guard', () => ({
  InternalKeyGuard: class InternalKeyGuard {},
}));

describe('InternalAppointmentsController [F3]', () => {
  const service = { findPastByPet: jest.fn() };
  let controller: InternalAppointmentsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new InternalAppointmentsController(service as unknown as AppointmentsService);
  });

  it('delega la consulta al servicio y devuelve su respuesta', async () => {
    const query = { petId: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90', from: '2026-10-01T00:00:00Z' };
    const response = { data: [{ id: 'a1', status: 'completed' }] };
    service.findPastByPet.mockResolvedValue(response);

    await expect(controller.findPast(query)).resolves.toBe(response);
    expect(service.findPastByPet).toHaveBeenCalledWith(query);
  });

  it('está protegido por InternalKeyGuard (X-Internal-Key)', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, InternalAppointmentsController);
    expect(guards).toContain(InternalKeyGuard);
  });

  it('vive bajo /internal/appointments, nunca bajo /v1', () => {
    expect(Reflect.getMetadata('path', InternalAppointmentsController)).toBe('internal/appointments');
  });
});
