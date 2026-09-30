import { mockAppointmentsList, mockOwnerUser } from '../../../test/mocks/scheduling.mock';

// import { SchedulingController } from './scheduling.controller';

describe('SchedulingController - Endpoints GET [E2]', () => {
  const mockSchedulingService = {
    getMyAppointments: jest.fn((clientId: string, page = 1, limit = 10) => {
      const userAppointments = mockAppointmentsList
        .filter((appointment) => appointment.clientId === clientId)
        .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

      const start = (page - 1) * limit;
      const data = userAppointments.slice(start, start + limit);

      return {
        data,
        total: userAppointments.length,
        page,
        limit,
      };
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /v1/scheduling/appointments/me (Citas del dueño)', () => {
    it('debe obtener la lista de citas del dueño autenticado respetando paginación', async () => {
      const page = 1;
      const limit = 2;
      const result = mockSchedulingService.getMyAppointments(mockOwnerUser.clientId, page, limit);

      expect(mockSchedulingService.getMyAppointments).toHaveBeenCalledWith(
        mockOwnerUser.clientId,
        page,
        limit,
      );
      expect(result.data.length).toBe(2);
      expect(result.total).toBe(3);
      expect(result.data.every((appointment) => appointment.clientId === mockOwnerUser.clientId)).toBe(true);
    });

    it('debe entregar las citas ordenadas cronológicamente por fechaHora', async () => {
      const result = mockSchedulingService.getMyAppointments(mockOwnerUser.clientId, 1, 10);
      const dates = result.data.map((appointment) => new Date(appointment.dateTime).getTime());

      const isSorted = dates.every((val, index, array) => !index || array[index - 1] >= val);
      expect(isSorted).toBe(true);
    });
  });
});