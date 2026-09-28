export interface MockAppointment {
  id: string;
  slotId: string;
  petId: string;
  clientId: string;
  veterinarianId: string;
  specialty: string;
  dateTime: string; // ISO 8601
  status: 'reservada' | 'confirmada' | 'realizada' | 'cancelada';
}

export const mockOwnerUser = {
  sub: '55555555-5555-5555-5555-555555555553',
  email: 'dueno@vetconecta.cl',
  role: 'owner',
  clientId: '22222222-2222-2222-2222-222222222222',
};

export const mockAppointmentsList: MockAppointment[] = [
  {
    id: 'apt-001',
    slotId: 'slot-101',
    petId: 'pet-uuid-001',
    clientId: '22222222-2222-2222-2222-222222222222',
    veterinarianId: '55555555-5555-5555-5555-555555555551',
    specialty: 'Medicina General',
    dateTime: '2026-10-15T10:00:00Z',
    status: 'confirmada',
  },
  {
    id: 'apt-002',
    slotId: 'slot-102',
    petId: 'pet-uuid-002',
    clientId: '22222222-2222-2222-2222-222222222222',
    veterinarianId: '55555555-5555-5555-5555-555555555551',
    specialty: 'Vacunación',
    dateTime: '2026-09-01T15:30:00Z',
    status: 'realizada',
  },
  {
    id: 'apt-003',
    slotId: 'slot-103',
    petId: 'pet-uuid-001',
    clientId: '22222222-2222-2222-2222-222222222222',
    veterinarianId: '55555555-5555-5555-5555-555555555551',
    specialty: 'Medicina General',
    dateTime: '2026-11-20T11:00:00Z',
    status: 'reservada',
  },
  {
    id: 'apt-004',
    slotId: 'slot-104',
    petId: 'pet-uuid-003',
    clientId: '77777777-7777-7777-7777-777777777777',
    veterinarianId: '55555555-5555-5555-5555-555555555551',
    specialty: 'Medicina General',
    dateTime: '2026-10-16T12:00:00Z',
    status: 'confirmada',
  },
];