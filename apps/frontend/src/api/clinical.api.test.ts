import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ClinicalEventFormValues } from "../types/clinical.types";
import { toDateInputValue } from "../utils/age";
import { api } from "./axios";
import { createClinicalEvent, listClinicalEvents } from "./clinical.api";

vi.mock("./axios", () => ({ api: { post: vi.fn(), get: vi.fn() } }));

const PET_ID = "3f8a1c52-0d4e-4b7a-9a21-6c5e8d2b9f10";
const post = vi.mocked(api.post);
const get = vi.mocked(api.get);

const consultation: ClinicalEventFormValues = {
  type: "consultation",
  date: "2026-11-10",
  weightKg: "8.5",
  notes: "  Paciente estable  ",
  diagnosis: "  Gastritis leve ",
  nextCheckup: "2026-12-10",
  vaccineName: "",
  batch: "",
};

const vaccine: ClinicalEventFormValues = {
  type: "vaccine",
  date: "2026-11-10",
  weightKg: "8.5",
  notes: "Sin reacciones",
  diagnosis: "",
  nextCheckup: "2026-12-10",
  vaccineName: " Antirrábica ",
  batch: " L-2026-014 ",
};

/** Body that the last POST sent. */
const sentBody = () => post.mock.calls[0][1] as Record<string, unknown>;

describe("clinical.api", () => {
  beforeEach(() => {
    post.mockResolvedValue({ data: { id: "event-1" } });
    get.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe("createClinicalEvent: contract with CreateClinicalEventDto (F2)", () => {
    it("posts to /v1/clinical/events and returns the created event", async () => {
      const created = await createClinicalEvent(PET_ID, consultation);
      expect(post).toHaveBeenCalledWith("/v1/clinical/events", expect.any(Object));
      expect(created).toEqual({ id: "event-1" });
    });

    it("sends a consultation with its own fields and no vaccine fields", async () => {
      await createClinicalEvent(PET_ID, consultation);
      expect(Object.keys(sentBody()).sort()).toEqual(
        ["date", "diagnosis", "nextCheckup", "notes", "petId", "type", "weightKg"].sort(),
      );
      expect(sentBody()).toMatchObject({
        petId: PET_ID,
        type: "consultation",
        weightKg: 8.5,
        notes: "Paciente estable",
        diagnosis: "Gastritis leve",
        nextCheckup: "2026-12-10",
      });
    });

    it("sends a checkup like a consultation", async () => {
      await createClinicalEvent(PET_ID, { ...consultation, type: "checkup" });
      expect(sentBody()).toMatchObject({ type: "checkup", diagnosis: "Gastritis leve", nextCheckup: "2026-12-10" });
      expect(sentBody()).not.toHaveProperty("vaccineName");
    });

    it("sends a vaccine with its own fields and no diagnosis or nextCheckup", async () => {
      await createClinicalEvent(PET_ID, vaccine);
      expect(Object.keys(sentBody()).sort()).toEqual(
        ["batch", "boosterDate", "date", "notes", "petId", "type", "vaccineName", "weightKg"].sort(),
      );
      expect(sentBody()).toMatchObject({
        type: "vaccine",
        vaccineName: "Antirrábica",
        batch: "L-2026-014",
        boosterDate: "2026-12-10",
      });
    });

    it("never sends the veterinarian: the backend takes it from the JWT (BR-3)", async () => {
      await createClinicalEvent(PET_ID, consultation);
      expect(sentBody()).not.toHaveProperty("veterinarianId");
      expect(sentBody()).not.toHaveProperty("veterinarioId");
    });

    it("sends the weight as a number", async () => {
      await createClinicalEvent(PET_ID, { ...consultation, weightKg: "10.25" });
      expect(sentBody().weightKg).toBe(10.25);
    });
  });

  describe("createClinicalEvent: date of the event", () => {
    it("sends the current time when the event is today", async () => {
      const before = Date.now();
      await createClinicalEvent(PET_ID, { ...consultation, date: toDateInputValue(new Date()) });
      const sent = new Date(sentBody().date as string).getTime();
      expect(sent).toBeGreaterThanOrEqual(before);
      expect(sent).toBeLessThanOrEqual(Date.now());
    });

    it("sends the local noon of a past day, so it does not change day in Chile", async () => {
      await createClinicalEvent(PET_ID, { ...consultation, date: "2026-11-10" });
      const sent = new Date(sentBody().date as string);
      expect([sent.getFullYear(), sent.getMonth(), sent.getDate(), sent.getHours()]).toEqual([2026, 10, 10, 12]);
    });

    it("never sends a date in the future for a past day", async () => {
      await createClinicalEvent(PET_ID, { ...consultation, date: "2026-11-10" });
      expect(new Date(sentBody().date as string).getTime()).toBeLessThan(Date.now());
    });
  });

  describe("listClinicalEvents", () => {
    it("reads the carnet of the pet", async () => {
      const events = [{ id: "e1" }];
      get.mockResolvedValue({ data: events });
      await expect(listClinicalEvents(PET_ID)).resolves.toBe(events);
      expect(get).toHaveBeenCalledWith(`/v1/clinical/pets/${PET_ID}/carnet`);
    });
  });
});
