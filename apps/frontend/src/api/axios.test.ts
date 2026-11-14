import { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./axios";

const FALLBACK = "No se pudo completar la acción.";

/** An error like the ones the API answers with: `{ message, details? }` in the body. */
function apiError(data: unknown, status = 400): AxiosError {
  const response = { data, status, statusText: "", headers: {}, config: {} } as AxiosResponse;
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, response);
}

describe("getErrorMessage", () => {
  it("uses the message of the API", () => {
    expect(getErrorMessage(apiError({ message: "Tu rol no tiene permiso." }, 403), FALLBACK)).toBe(
      "Tu rol no tiene permiso.",
    );
  });

  it("joins the messages when class-validator sends a list", () => {
    const error = apiError({ message: ["El peso debe ser numérico", "Las observaciones son obligatorias"] });
    expect(getErrorMessage(error, FALLBACK)).toBe("El peso debe ser numérico Las observaciones son obligatorias");
  });

  it("adds the failed fields of a VALIDATION_ERROR (details)", () => {
    const error = apiError({
      error: "VALIDATION_ERROR",
      message: "Los datos enviados no son válidos.",
      details: ["El peso en kg debe ser mayor a 0", "El tipo debe ser consultation, vaccine o checkup"],
    });
    expect(getErrorMessage(error, FALLBACK)).toBe(
      "Los datos enviados no son válidos. El peso en kg debe ser mayor a 0. El tipo debe ser consultation, vaccine o checkup",
    );
  });

  it("ignores empty details and values that are not text", () => {
    const error = apiError({ message: "Los datos enviados no son válidos.", details: ["", "  ", 42, null] });
    expect(getErrorMessage(error, FALLBACK)).toBe("Los datos enviados no son válidos.");
  });

  it("uses the fallback when the body has no message", () => {
    expect(getErrorMessage(apiError({}), FALLBACK)).toBe(FALLBACK);
    expect(getErrorMessage(apiError({ message: "   " }), FALLBACK)).toBe(FALLBACK);
  });

  it("uses the fallback for errors that are not from the API", () => {
    expect(getErrorMessage(new Error("boom"), FALLBACK)).toBe(FALLBACK);
    expect(getErrorMessage(undefined, FALLBACK)).toBe(FALLBACK);
  });
});
