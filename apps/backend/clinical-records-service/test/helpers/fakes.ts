import { AppointmentRange, AppointmentsClient, PastAppointment } from '../../src/modules/history/clients/appointments.client';
import { ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import { VetsLookup } from '../../src/modules/history/clients/vets.lookup';
import { PetRecord } from './fixtures';

/**
 * Doble de clients-pets: responde como GET /internal/pets/:id/owner/:userId. Si el usuario no
 * tiene cliente o la mascota no es de su cliente, clients-pets responde 404 y el cliente real
 * lo traduce a 403; `unavailable` simula que el servicio no responde (503).
 */
export class FakeClientsPetsClient {
  unavailable = false;

  constructor(
    private readonly pets: PetRecord[],
    private readonly clientOfUser: Record<string, string>,
  ) {}

  async assertPetOwnership(petId: string, userId: string): Promise<void> {
    if (this.unavailable) {
      throw new ServiceUnavailableException('No fue posible verificar la mascota en clients-pets-service.');
    }
    const clientId = this.clientOfUser[userId];
    const owned = clientId !== undefined && this.pets.some((pet) => pet.id === petId && pet.clientId === clientId);
    if (!owned) {
      throw new ForbiddenException('No tienes permiso para consultar el carnet de esta mascota.');
    }
  }
}

/** Doble del catálogo: nombres por id; los que no conoce quedan en null. */
export class FakeVetsLookup extends VetsLookup {
  constructor(private readonly names: Record<string, string>) {
    super();
  }

  async findNames(vetIds: string[]): Promise<Map<string, string | null>> {
    return new Map(vetIds.map((id) => [id, this.names[id] ?? null]));
  }
}

/** Doble de scheduling: devuelve las citas que se le cargan, o null si "está caído". */
export class FakeAppointmentsClient extends AppointmentsClient {
  appointments: PastAppointment[] | null = [];
  lastCall: { petId: string; range: AppointmentRange } | null = null;

  async findPastByPet(petId: string, range: AppointmentRange): Promise<PastAppointment[] | null> {
    this.lastCall = { petId, range };
    return this.appointments;
  }
}
