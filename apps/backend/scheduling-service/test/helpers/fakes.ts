import { PetInfo, PetsLookup } from '../../src/modules/appointments/clients/pets.lookup';
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
