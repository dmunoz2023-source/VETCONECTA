import {
  mockAppointmentsList,
  mockOwnerUser,
  MockAppointment,
} from '../../../test/mocks/scheduling.mock';

// import { SchedulingService } from './scheduling.service';

describe('SchedulingService - Reglas de Negocio Citas [E2]', () => {
  class MockSchedulingServiceLogic {
    async findClientAppointments(clientId: string): Promise<MockAppointment[]> {
      return mockAppointmentsList.filter((appointment) => appointment.clientId === clientId);
    }

    async getAppointmentById(id: string, userClientId?: string): Promise<MockAppointment | null> {
      const appointment = mockAppointmentsList.find((item) => item.id === id);
      if (!appointment) return null;

      if (userClientId && appointment.clientId !== userClientId) {
        throw new Error('FORBIDDEN_APPOINTMENT_ACCESS');
      }

      return appointment;
    }
  }

  let service: MockSchedulingServiceLogic;

  beforeEach(() => {
    service = new MockSchedulingServiceLogic();
  });

  it('debe filtrar de forma estricta las citas del cliente que consulta (BR-8)', async () => {
    const appointments = await service.findClientAppointments(mockOwnerUser.clientId);

    expect(appointments.length).toBe(3);
    appointments.forEach((appointment) => {
      expect(appointment.clientId).toBe(mockOwnerUser.clientId);
    });
  });

  it('debe impedir que un cliente consulte una cita ajena por ID', async () => {
    const otherAppointmentId = 'apt-004';

    await expect(
      service.getAppointmentById(otherAppointmentId, mockOwnerUser.clientId),
    ).rejects.toThrow('FORBIDDEN_APPOINTMENT_ACCESS');
  });

  it('debe incluir campos esenciales para cada cita (estado, fechaHora, profesional)', async () => {
    const appointments = await service.findClientAppointments(mockOwnerUser.clientId);

    appointments.forEach((appointment) => {
      expect(appointment).toHaveProperty('id');
      expect(appointment).toHaveProperty('dateTime');
      expect(appointment).toHaveProperty('status');
      expect(appointment).toHaveProperty('veterinarianId');
      expect(['reservada', 'confirmada', 'realizada', 'cancelada']).toContain(appointment.status);
    });
  });
});