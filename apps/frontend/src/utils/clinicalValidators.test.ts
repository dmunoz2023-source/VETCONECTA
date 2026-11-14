import { describe, expect, it } from "vitest";
import type { ClinicalEventFormValues } from "../types/clinical.types";
import { validateClinicalEventForm } from "./clinicalValidators";

// Fixed "today" so the date rules do not depend on the day the tests run.
const TODAY = new Date(2026, 10, 13, 12, 0, 0);

const consultation = (overrides: Partial<ClinicalEventFormValues> = {}): ClinicalEventFormValues => ({
  type: "consultation",
  date: "2026-11-13",
  weightKg: "8.5",
  notes: "Paciente estable",
  diagnosis: "Gastritis leve",
  nextCheckup: "2026-12-13",
  vaccineName: "",
  batch: "",
  ...overrides,
});

const vaccine = (overrides: Partial<ClinicalEventFormValues> = {}): ClinicalEventFormValues => ({
  type: "vaccine",
  date: "2026-11-13",
  weightKg: "8.5",
  notes: "Sin reacciones",
  diagnosis: "",
  nextCheckup: "2026-12-13",
  vaccineName: "Antirrábica",
  batch: "L-2026-014",
  ...overrides,
});

const validate = (values: ClinicalEventFormValues) => validateClinicalEventForm(values, TODAY);

describe("validateClinicalEventForm", () => {
  describe("valid forms", () => {
    it("accepts a complete consultation", () => {
      expect(validate(consultation())).toEqual({});
    });

    it("accepts a complete checkup", () => {
      expect(validate(consultation({ type: "checkup" }))).toEqual({});
    });

    it("accepts a complete vaccine", () => {
      expect(validate(vaccine())).toEqual({});
    });

    it("accepts the next date on the same day as the event", () => {
      expect(validate(consultation({ nextCheckup: "2026-11-13" }))).toEqual({});
    });
  });

  describe("always required fields (flow A1 of UC-06)", () => {
    it("asks for the type when none is chosen", () => {
      expect(validate(consultation({ type: "" })).type).toBe("Selecciona el tipo de evento.");
    });

    it("asks for the date", () => {
      expect(validate(consultation({ date: "" })).date).toBe("Ingresa la fecha del evento.");
    });

    it("rejects a date that does not exist", () => {
      expect(validate(consultation({ date: "2026-02-31" })).date).toBe("Ingresa una fecha válida.");
    });

    it("rejects a future date", () => {
      expect(validate(consultation({ date: "2026-11-14" })).date).toBe("La fecha del evento no puede ser futura.");
    });

    it("asks for the weight", () => {
      expect(validate(consultation({ weightKg: "" })).weightKg).toBe("Ingresa el peso.");
    });

    it.each(["0", "0.05", "-3", "abc"])("rejects the weight %s", (weightKg) => {
      expect(validate(consultation({ weightKg })).weightKg).toBe("El peso debe ser mayor a 0 kg.");
    });

    it("asks for the notes, also when they are only spaces", () => {
      expect(validate(consultation({ notes: "" })).notes).toBe("Ingresa las observaciones.");
      expect(validate(consultation({ notes: "   " })).notes).toBe("Ingresa las observaciones.");
    });

    it("reports every missing field at once", () => {
      const errors = validate({
        type: "",
        date: "",
        weightKg: "",
        notes: "",
        diagnosis: "",
        nextCheckup: "",
        vaccineName: "",
        batch: "",
      });
      expect(Object.keys(errors).sort()).toEqual(["date", "notes", "type", "weightKg"]);
    });
  });

  describe("consultation and checkup", () => {
    it.each(["consultation", "checkup"] as const)("%s asks for diagnosis and next checkup", (type) => {
      const errors = validate(consultation({ type, diagnosis: "", nextCheckup: "" }));
      expect(errors.diagnosis).toBe("Ingresa el diagnóstico.");
      expect(errors.nextCheckup).toBe("Ingresa la fecha del próximo control.");
    });

    it("does not ask for vaccine fields", () => {
      const errors = validate(consultation({ vaccineName: "", batch: "" }));
      expect(errors.vaccineName).toBeUndefined();
      expect(errors.batch).toBeUndefined();
    });

    it("limits the diagnosis to 200 characters", () => {
      expect(validate(consultation({ diagnosis: "a".repeat(200) })).diagnosis).toBeUndefined();
      expect(validate(consultation({ diagnosis: "a".repeat(201) })).diagnosis).toBe("Máximo 200 caracteres.");
    });
  });

  describe("vaccine", () => {
    it("asks for name, batch and next dose", () => {
      const errors = validate(vaccine({ vaccineName: "", batch: "", nextCheckup: "" }));
      expect(errors.vaccineName).toBe("Ingresa el nombre de la vacuna.");
      expect(errors.batch).toBe("Ingresa el lote de la vacuna.");
      expect(errors.nextCheckup).toBe("Ingresa la fecha de la próxima dosis.");
    });

    it("does not ask for a diagnosis", () => {
      expect(validate(vaccine({ diagnosis: "" })).diagnosis).toBeUndefined();
    });

    it("limits the vaccine name to 100 and the batch to 50 characters", () => {
      expect(validate(vaccine({ vaccineName: "a".repeat(100), batch: "b".repeat(50) }))).toEqual({});
      expect(validate(vaccine({ vaccineName: "a".repeat(101) })).vaccineName).toBe("Máximo 100 caracteres.");
      expect(validate(vaccine({ batch: "b".repeat(51) })).batch).toBe("Máximo 50 caracteres.");
    });
  });

  describe("next date", () => {
    it("rejects a next date earlier than the event", () => {
      expect(validate(consultation({ nextCheckup: "2026-11-12" })).nextCheckup).toBe(
        "No puede ser anterior a la fecha del evento.",
      );
    });

    it("rejects a next date that does not exist", () => {
      expect(validate(consultation({ nextCheckup: "2026-13-40" })).nextCheckup).toBe("Ingresa una fecha válida.");
    });
  });
});
