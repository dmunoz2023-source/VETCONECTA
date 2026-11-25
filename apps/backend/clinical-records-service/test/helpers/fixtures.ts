
export const CLIENT_A = '22222222-2222-2222-2222-222222222222';
export const CLIENT_B = '22222222-2222-2222-2222-222222222223';

export const PET_A = '031b94dc-6453-4a16-bcaf-da1624b47e4d'; // de CLIENT_A
export const PET_A2 = '4ff2a12f-0ad9-479d-9fb4-3637e1688cd8'; // de CLIENT_A, sin eventos
export const PET_B = 'b3dd944e-4095-4405-9d60-f6541ef9adee'; // de CLIENT_B

export const VET_ANA = '55555555-5555-5555-5555-555555555551';
export const VET_LUIS = '55555555-5555-5555-5555-555555555559';
export const VET_SIN_NOMBRE = '55555555-5555-5555-5555-555555555558';

/** Mascota tal como la conoce clients-pets: a qué cliente pertenece. */
export interface PetRecord {
  id: string;
  clientId: string;
}

export const OWNER_A_USER = '55555555-5555-5555-5555-555555555553'; // usuario del CLIENT_A

/** Cliente de cada usuario dueño (clients-pets lo resuelve por `user_id`). */
export const CLIENT_OF_USER: Record<string, string> = { [OWNER_A_USER]: CLIENT_A };

export const PETS: PetRecord[] = [
  { id: PET_A, clientId: CLIENT_A },
  { id: PET_A2, clientId: CLIENT_A },
  { id: PET_B, clientId: CLIENT_B },
];

export const VET_NAMES: Record<string, string> = {
  [VET_ANA]: 'Ana Pérez',
  [VET_LUIS]: 'Luis Soto',
};

/** Cabeceras que normalmente inyecta el Gateway. */
export const asVet = { 'X-User-Id': VET_ANA, 'X-User-Role': 'vet' };
export const asReception = { 'X-User-Id': '55555555-5555-5555-5555-555555555552', 'X-User-Role': 'reception' };
export const asAdmin = { 'X-User-Id': '11111111-1111-1111-1111-111111111111', 'X-User-Role': 'admin' };
export const asOwnerA = { 'X-User-Id': OWNER_A_USER, 'X-User-Role': 'owner' };
/** Dueño sin ficha de cliente en clients-pets. */
export const asOwnerSinCliente = { 'X-User-Id': '55555555-5555-5555-5555-555555555560', 'X-User-Role': 'owner' };
