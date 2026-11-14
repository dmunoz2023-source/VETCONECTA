import { act, renderHook } from "@testing-library/react";
import { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import type { FormEvent } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClinicalEvent } from "../api/clinical.api";
import type { ClinicalEvent, ClinicalEventFormValues } from "../types/clinical.types";
import { toDateInputValue } from "../utils/age";
import { useClinicalEventForm } from "./useClinicalEventForm";

vi.mock("../api/clinical.api", () => ({ createClinicalEvent: vi.fn() }));

const PET_ID = "3f8a1c52-0d4e-4b7a-9a21-6c5e8d2b9f10";
const create = vi.mocked(createClinicalEvent);
const submitEvent = { preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>;

const savedEvent = { id: "event-1", petId: PET_ID } as ClinicalEvent;

/** A consultation that passes validation. */
const VALID: Partial<ClinicalEventFormValues> = {
  type: "consultation",
  weightKg: "8.5",
  notes: "Paciente estable",
  diagnosis: "Gastritis leve",
  nextCheckup: toDateInputValue(new Date()),
};

function renderForm() {
  const onSaved = vi.fn();
  const view = renderHook(() => useClinicalEventForm({ petId: PET_ID, onSaved }));
  return { ...view, onSaved };
}

function fill(result: ReturnType<typeof renderForm>["result"], values: Partial<ClinicalEventFormValues>) {
  act(() => {
    for (const [field, value] of Object.entries(values)) {
      result.current.setValue(field as keyof ClinicalEventFormValues, value);
    }
  });
}

function apiError(data: unknown, status: number): AxiosError {
  const response = { data, status, statusText: "", headers: {}, config: {} } as AxiosResponse;
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, response);
}

describe("useClinicalEventForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    create.mockResolvedValue(savedEvent);
  });

  it("starts empty, with today as the date and no errors", () => {
    const { result } = renderForm();
    expect(result.current.values).toMatchObject({ type: "", date: toDateInputValue(new Date()), weightKg: "", notes: "" });
    expect(result.current.errors).toEqual({});
    expect(result.current.submitting).toBe(false);
    expect(result.current.serverError).toBeNull();
  });

  it("updates one field at a time", () => {
    const { result } = renderForm();
    fill(result, { weightKg: "9" });
    expect(result.current.values.weightKg).toBe("9");
    expect(result.current.values.notes).toBe("");
  });

  it("does not send an incomplete form and shows the errors (flow A1 of UC-06)", async () => {
    const { result, onSaved } = renderForm();
    await act(async () => {
      await result.current.handleSubmit(submitEvent);
    });
    expect(create).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
    expect(Object.keys(result.current.errors).sort()).toEqual(["notes", "type", "weightKg"]);
  });

  it("does not show errors before the first attempt to save", () => {
    const { result } = renderForm();
    fill(result, { weightKg: "0" });
    expect(result.current.errors).toEqual({});
  });

  it("sends a valid form with the pet and calls onSaved with the created event", async () => {
    const { result, onSaved } = renderForm();
    fill(result, VALID);
    await act(async () => {
      await result.current.handleSubmit(submitEvent);
    });
    expect(create).toHaveBeenCalledWith(PET_ID, expect.objectContaining({ type: "consultation", weightKg: "8.5" }));
    expect(onSaved).toHaveBeenCalledWith(savedEvent);
    expect(result.current.serverError).toBeNull();
  });

  it("shows the message of the API on a 400, with the failed fields, and keeps the data", async () => {
    create.mockRejectedValue(
      apiError(
        {
          error: "VALIDATION_ERROR",
          message: "Los datos enviados no son válidos.",
          details: ["El peso en kg debe ser mayor a 0"],
        },
        400,
      ),
    );
    const { result, onSaved } = renderForm();
    fill(result, VALID);
    await act(async () => {
      await result.current.handleSubmit(submitEvent);
    });
    expect(result.current.serverError).toBe("Los datos enviados no son válidos. El peso en kg debe ser mayor a 0");
    expect(result.current.values).toMatchObject(VALID);
    expect(result.current.submitting).toBe(false);
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("shows the message of the API on a 403", async () => {
    create.mockRejectedValue(apiError({ message: "Tu rol no tiene permiso para registrar eventos." }, 403));
    const { result } = renderForm();
    fill(result, VALID);
    await act(async () => {
      await result.current.handleSubmit(submitEvent);
    });
    expect(result.current.serverError).toBe("Tu rol no tiene permiso para registrar eventos.");
  });

  it("uses a generic message when the error has nothing to show", async () => {
    create.mockRejectedValue(new Error("network down"));
    const { result } = renderForm();
    fill(result, VALID);
    await act(async () => {
      await result.current.handleSubmit(submitEvent);
    });
    expect(result.current.serverError).toBe("No se pudo registrar el evento clínico.");
  });
});
