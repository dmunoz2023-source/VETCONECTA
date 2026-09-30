export interface MockPet {
  id: string;
  clientId: string;
  name: string;
  birthDate: string; // ISO 8601 YYYY-MM-DD
  currentWeight: number;
  isActive: boolean;
  age?: {
    years: number;
    months: number;
  };
}

export interface MockUserSession {
  sub: string;
  email: string;
  role: 'owner' | 'vet' | 'reception' | 'admin';
  clientId?: string;
}

export const mockOwnerUser: MockUserSession = {
  sub: '55555555-5555-5555-5555-555555555553',
  email: 'dueno@vetconecta.cl',
  role: 'owner',
  clientId: '22222222-2222-2222-2222-222222222222',
};

export const mockOtherOwnerUser: MockUserSession = {
  sub: '66666666-6666-6666-6666-666666666666',
  email: 'otro_dueno@vetconecta.cl',
  role: 'owner',
  clientId: '77777777-7777-7777-7777-777777777777',
};

export const mockVetUser: MockUserSession = {
  sub: '55555555-5555-5555-5555-555555555551',
  email: 'veterinario@vetconecta.cl',
  role: 'vet',
};

export const mockPetsList: MockPet[] = [
  {
    id: 'pet-uuid-001',
    clientId: '22222222-2222-2222-2222-222222222222',
    name: 'Polo',
    birthDate: '2023-05-10',
    currentWeight: 5.5,
    isActive: true,
  },
  {
    id: 'pet-uuid-002',
    clientId: '22222222-2222-2222-2222-222222222222',
    name: 'Luna',
    birthDate: '2021-08-20',
    currentWeight: 12.0,
    isActive: true,
  },
  {
    id: 'pet-uuid-003',
    clientId: '77777777-7777-7777-7777-777777777777',
    name: 'Rocky',
    birthDate: '2024-01-15',
    currentWeight: 8.2,
    isActive: true,
  },
  {
    id: 'pet-uuid-004',
    clientId: '22222222-2222-2222-2222-222222222222',
    name: 'Bobi (Inactivo)',
    birthDate: '2019-03-01',
    currentWeight: 10.0,
    isActive: false,
  },
];

export function calculateAge(birthDateStr: string): { years: number; months: number } {
  const birth = new Date(birthDateStr);
  const now = new Date('2026-09-01');

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }

  return { years, months };
}