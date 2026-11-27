import { http, HttpResponse } from 'msw';

export type StaffRole = 'vet' | 'reception' | 'admin' | 'owner';

export function createMockJwt(role: StaffRole): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: '55555555-5555-5555-5555-555555555551',
      email: `${role}@vetconecta.cl`,
      role,
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
  );
  return `${header}.${payload}.mock-signature`;
}

function todayAt(hour: number, minute: number): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const mockAppointments = [
  {
    id: 'apt-001',
    slotId: 's1',
    petId: 'pet-uuid-001',
    title: 'Consulta General - Perlita',
    patientName: 'Perlita',
    clientName: 'María González',
    phone: '+56 9 8765 4321',
    vetId: 'v1',
    vetName: 'Dr. Ricardo Silva',
    specialtyId: 'esp1',
    specialtyName: 'Medicina General',
    start: todayAt(9, 0),
    end: todayAt(9, 30),
    status: 'confirmada',
  },
  {
    id: 'apt-002',
    slotId: 's2',
    petId: 'pet-uuid-002',
    title: 'Control Vacuna - Simba',
    patientName: 'Simba',
    clientName: 'Carlos Muñoz',
    phone: '+56 9 1234 5678',
    vetId: 'v2',
    vetName: 'Dra. Elena Rostova',
    specialtyId: 'esp2',
    specialtyName: 'Inmunología',
    start: todayAt(10, 30),
    end: todayAt(11, 0),
    status: 'reservada',
  },
];

export const handlers = [
  // Auth
  http.post('*/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as {
      identifier?: string;
      email?: string;
      password?: string;
    };
    const userIdentifier = body.identifier ?? body.email ?? '';

    if (userIdentifier === 'error@vetconecta.cl') {
      return HttpResponse.json(
        { statusCode: 401, message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const role: StaffRole = userIdentifier.includes('owner')
      ? 'owner'
      : userIdentifier.includes('reception')
        ? 'reception'
        : 'vet';

    return HttpResponse.json({
      accessToken: createMockJwt(role),
      user: {
        id: '55555555-5555-5555-5555-555555555551',
        email: userIdentifier || 'vet@vetconecta.cl',
        role,
      },
    });
  }),

  // Pets
  http.get('*/v1/pets', () => {
    return HttpResponse.json([
      {
        id: 'pet-uuid-001',
        name: 'Polo',
        species: 'dog',
        breed: 'Mestizo',
        birthDate: '2023-05-10',
        weight: 5.5,
        clientId: '22222222-2222-2222-2222-222222222222',
      },
    ]);
  }),

  http.post('*/v1/pets', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: 'pet-uuid-new', ...body }, { status: 201 });
  }),

  // Clients
  http.get('*/v1/clients', () => {
    return HttpResponse.json({
      data: [
        {
          id: '22222222-2222-2222-2222-222222222222',
          rut: '12.345.678-9',
          firstName: 'María',
          lastName: 'González',
          phone: '+56 9 8765 4321',
        },
      ],
      meta: { total: 1, page: 1, limit: 10 },
    });
  }),

  // Scheduling / Appointments (envuelto en { data } como espera fetchAppointments)
  http.get('*/v1/scheduling/appointments', () => {
    return HttpResponse.json({ data: mockAppointments });
  }),

  http.post('*/v1/scheduling/appointments', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        data: {
          id: 'apt-new',
          status: 'confirmada',
          start: todayAt(12, 0),
          end: todayAt(12, 30),
          ...body,
        },
      },
      { status: 201 }
    );
  }),

  // Clinical Events
  http.post('*/v1/clinical/events', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: 'evt-new', ...body }, { status: 201 });
  }),
];