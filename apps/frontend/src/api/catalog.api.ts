import { api } from "./axios";
import type { Specialty, SpecialtyFormValues, Vet } from "../types/agenda.types";

/** GET /v1/catalog/specialties: especialidades activas con su duración. */
export async function listSpecialties(): Promise<Specialty[]> {
  const { data } = await api.get<Specialty[]>("/v1/catalog/specialties");
  return data;
}

/** POST /v1/catalog/specialties (reception, admin). */
export async function createSpecialty(values: SpecialtyFormValues): Promise<Specialty> {
  const { data } = await api.post<Specialty>("/v1/catalog/specialties", values);
  return data;
}

/** PATCH /v1/catalog/specialties/{id} (reception, admin). */
export async function updateSpecialty(id: string, values: Partial<SpecialtyFormValues>): Promise<Specialty> {
  const { data } = await api.patch<Specialty>(`/v1/catalog/specialties/${id}`, values);
  return data;
}

/** DELETE /v1/catalog/specialties/{id}: baja lógica (reception, admin). */
export async function deactivateSpecialty(id: string): Promise<void> {
  await api.delete(`/v1/catalog/specialties/${id}`);
}

/** GET /v1/catalog/vets: veterinarios activos (G1). */
export async function listVets(): Promise<Vet[]> {
  const { data } = await api.get<Vet[]>("/v1/catalog/vets");
  return data;
}

/** GET /v1/catalog/vets/{vetId}/specialties (reception, admin). */
export async function listVetSpecialties(vetId: string): Promise<Specialty[]> {
  const { data } = await api.get<Specialty[]>(`/v1/catalog/vets/${vetId}/specialties`);
  return data;
}

/** POST /v1/catalog/vets/{vetId}/specialties: asigna y devuelve la lista actualizada. */
export async function assignVetSpecialty(vetId: string, specialtyId: string): Promise<Specialty[]> {
  const { data } = await api.post<Specialty[]>(`/v1/catalog/vets/${vetId}/specialties`, { specialtyId });
  return data;
}

/** DELETE /v1/catalog/vets/{vetId}/specialties/{specialtyId}. */
export async function unassignVetSpecialty(vetId: string, specialtyId: string): Promise<void> {
  await api.delete(`/v1/catalog/vets/${vetId}/specialties/${specialtyId}`);
}
