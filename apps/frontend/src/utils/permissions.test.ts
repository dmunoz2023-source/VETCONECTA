import { describe, expect, it } from "vitest";
import { can, rolesFor } from "./permissions";

describe("clinical permissions", () => {
  it("only the veterinarian registers clinical events (BR-6)", () => {
    expect(can("vet", "registerClinicalEvent")).toBe(true);
    expect(can("reception", "registerClinicalEvent")).toBe(false);
    expect(can("admin", "registerClinicalEvent")).toBe(false);
  });

  it("veterinarian and reception see the clinical record", () => {
    expect(can("vet", "viewClinicalHistory")).toBe(true);
    expect(can("reception", "viewClinicalHistory")).toBe(true);
  });

  it("the admin does not see the clinical record (F2 answers 403)", () => {
    expect(can("admin", "viewClinicalHistory")).toBe(false);
  });

  it("nobody has a permission without a session", () => {
    expect(can(undefined, "registerClinicalEvent")).toBe(false);
    expect(can(undefined, "viewClinicalHistory")).toBe(false);
  });

  it("rolesFor gives the roles that protect the routes", () => {
    expect(rolesFor("registerClinicalEvent")).toEqual(["vet"]);
    expect(rolesFor("viewClinicalHistory")).toEqual(["vet", "reception"]);
  });
});
