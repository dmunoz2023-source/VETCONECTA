import { AppointmentRange, AppointmentsClient, PastAppointment } from '../../src/modules/history/clients/appointments.client';
import { PetInfo, PetsLookup } from '../../src/modules/history/clients/pets.lookup';
import { VetsLookup } from '../../src/modules/history/clients/vets.lookup';

/** Doble de clients-pets: solo sabe de las mascotas que se le entregan. */
export class FakePetsLookup extends PetsLookup {
  constructor(private readonly pets: PetInfo[]) {
    super();
  }

  async findById(petId: string): Promise<PetInfo | null> {
    return this.pets.find((pet) => pet.id === petId) ?? null;
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
