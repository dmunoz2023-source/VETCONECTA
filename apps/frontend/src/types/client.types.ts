/**
 * Cliente (dueño de mascotas) tal como lo expone clients-pets-service
 * en GET /v1/clients y GET /v1/clients/{id}.
 * Nombres tomados de client.entity.ts (rama feat/A3-clients-pets-orm);
 * a confirmar cuando backend publique los DTO.
 */
export interface Client {
  id: string;
  userId: string;
  rut: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  district: string | null;
  active: boolean;
}

/** Cuerpo de POST /v1/clients. */
export interface CreateClientPayload {
  rut: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  district?: string;
}

/**
 * Cuerpo de PATCH /v1/clients/{id}: solo los campos que cambian.
 * El RUT no se edita: identifica al cliente y es único (UC-05 A1).
 */
export type UpdateClientPayload = Partial<Omit<CreateClientPayload, 'rut'>>;

/** Parámetros de búsqueda y paginación de GET /v1/clients. */
export interface ClientListParams {
  /** Texto libre: RUT, nombre o teléfono. */
  q?: string;
  page?: number;
  limit?: number;
}