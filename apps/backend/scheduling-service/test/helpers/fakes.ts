import { ServiceUnavailableException } from '@nestjs/common';
import { PetInfo, PetsLookup } from '../../src/modules/appointments/clients/pets.lookup';
import { PetOwnerCheck } from '../../src/modules/ratings/clients/pet-owner.check';
import {
  RemindersClient,
  ScheduleReminderInput,
} from '../../src/modules/appointments/clients/reminders.client';

/** Sustituye la consulta HTTP a clients-pets: las mascotas se registran en memoria. */
export class FakePetsLookup extends PetsLookup {
  private readonly pets = new Map<string, PetInfo>();

  add(pet: PetInfo): void {
    this.pets.set(pet.id, pet);
  }

  async findById(petId: string): Promise<PetInfo | null> {
    return this.pets.get(petId) ?? null;
  }
}

/** Sustituye a notifications-service: guarda las llamadas para poder comprobarlas. */
export class FakeRemindersClient extends RemindersClient {
  readonly scheduled: ScheduleReminderInput[] = [];
  readonly cancelled: string[] = [];

  async schedule(input: ScheduleReminderInput): Promise<boolean> {
    this.scheduled.push(input);
    return true;
  }

  async cancel(appointmentId: string): Promise<boolean> {
    this.cancelled.push(appointmentId);
    return true;
  }
}

/**
 * [K2] Sustituye la verificación de dueño en clients-pets: cada mascota se asocia al
 * usuario dueño en memoria. `unavailable` simula que clients-pets no responde.
 */
export class FakePetOwnerCheck extends PetOwnerCheck {
  private readonly owners = new Map<string, string>();
  unavailable = false;

  add(petId: string, userId: string): void {
    this.owners.set(petId, userId);
  }

  async isOwner(petId: string, userId: string): Promise<boolean> {
    if (this.unavailable) {
      throw new ServiceUnavailableException('clients-pets no responde');
    }
    return this.owners.get(petId) === userId;
  }
}
