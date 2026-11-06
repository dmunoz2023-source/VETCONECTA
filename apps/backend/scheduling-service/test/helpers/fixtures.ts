import { PetInfo } from '../../src/modules/appointments/clients/pets.lookup';

export const VET_A = '55555555-5555-5555-5555-5555555555a1';
export const VET_B = '55555555-5555-5555-5555-5555555555b2';

export const SPECIALTY_CONSULTA = 'dddddddd-0000-4000-8000-000000000001';
export const SPECIALTY_CIRUGIA = 'dddddddd-0000-4000-8000-000000000002';

export const OWNER_1 = {
  userId: '55555555-5555-5555-5555-555555555553',
  clientId: 'cccccccc-0000-4000-8000-000000000001',
};
export const OWNER_2 = {
  userId: '55555555-5555-5555-5555-555555555554',
  clientId: 'cccccccc-0000-4000-8000-000000000002',
};
export const RECEPTION_USER_ID = '55555555-5555-5555-5555-555555555552';

export const PET_OWNER_1: PetInfo = {
  id: 'aaaaaaaa-0000-4000-8000-000000000001',
  name: 'Firulais',
  clientId: OWNER_1.clientId,
  ownerUserId: OWNER_1.userId,
  active: true,
};
export const PET_OWNER_2: PetInfo = {
  id: 'aaaaaaaa-0000-4000-8000-000000000002',
  name: 'Michi',
  clientId: OWNER_2.clientId,
  ownerUserId: OWNER_2.userId,
  active: true,
};

/** Cabeceras que el API Gateway inyecta despues de validar el JWT. */
export function asOwner(owner: { userId: string; clientId: string }): Record<string, string> {
  return { 'X-User-Id': owner.userId, 'X-User-Role': 'owner', 'X-Client-Id': owner.clientId };
}

export function asReception(): Record<string, string> {
  return { 'X-User-Id': RECEPTION_USER_ID, 'X-User-Role': 'reception' };
}

/**
 * Fecha futura en UTC: `days` dias desde hoy a la hora indicada. Parte de la
 * fecha de hoy, asi los casos nunca caen en el pasado.
 */
export function futureUtc(days: number, hour: number, minute = 0): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days, hour, minute),
  );
}

/**
 * Escribe un instante con una zona horaria fija (ej. -3 => "2030-05-01T23:30:00-03:00").
 * Sirve para probar que la misma hora en distintas zonas es el mismo horario.
 */
export function withOffset(date: Date, offsetHours: number): string {
  const local = new Date(date.getTime() + offsetHours * 3_600_000).toISOString().slice(0, 19);
  const sign = offsetHours < 0 ? '-' : '+';
  const hours = String(Math.abs(offsetHours)).padStart(2, '0');
  return `${local}${sign}${hours}:00`;
}

/** Cuerpo de POST /v1/citas. */
export function citaBody(params: {
  petId: string;
  vetUserId: string;
  specialtyId: string;
  startTime: string;
}) {
  return params;
}
