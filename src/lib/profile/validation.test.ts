import { describe, expect, it } from "vitest";

import { validateCreateProfileForm, validateUpdateProfileForm } from "@/lib/profile/validation";

function makeFormData(values: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}

describe("validateCreateProfileForm", () => {
  it("accepts a valid metric payload", () => {
    const formData = makeFormData({
      username: "trainwithalex",
      unitsPreference: "metric",
      displayName: "Alex",
      gender: "non_binary",
      birthdate: "1998-05-10",
      heightCm: "178.4",
    });

    const result = validateCreateProfileForm(formData);

    expect(result.fieldErrors).toEqual({});
    expect(result.payload).toEqual({
      username: "trainwithalex",
      unitsPreference: "metric",
      displayName: "Alex",
      gender: "non_binary",
      birthdate: "1998-05-10",
      heightCm: 178.4,
    });
  });

  it("rejects missing required fields", () => {
    const formData = makeFormData({
      username: "",
      unitsPreference: "",
    });

    const result = validateCreateProfileForm(formData);

    expect(result.payload).toBeUndefined();
    expect(result.fieldErrors.username).toBeDefined();
    expect(result.fieldErrors.unitsPreference).toBeDefined();
  });

  it("rejects invalid optional fields", () => {
    const formData = makeFormData({
      username: "ok-user",
      unitsPreference: "imperial",
      gender: "unknown",
      birthdate: "05/10/1998",
      heightCm: "999",
    });

    const result = validateCreateProfileForm(formData);

    expect(result.payload).toBeUndefined();
    expect(result.fieldErrors.gender).toBeDefined();
    expect(result.fieldErrors.birthdate).toBeDefined();
    expect(result.fieldErrors.heightCm).toBeDefined();
  });
});

describe("validateUpdateProfileForm", () => {
  it("accepts a valid imperial payload", () => {
    const formData = makeFormData({
      unitsPreference: "imperial",
      displayName: "Alex",
      gender: "female",
      birthdate: "1990-01-15",
      heightCm: "162.56",
    });

    const result = validateUpdateProfileForm(formData);

    expect(result.fieldErrors).toEqual({});
    expect(result.payload).toEqual({
      unitsPreference: "imperial",
      displayName: "Alex",
      gender: "female",
      birthdate: "1990-01-15",
      heightCm: 162.56,
    });
  });

  it("accepts omitted optional fields", () => {
    const formData = makeFormData({
      unitsPreference: "metric",
    });

    const result = validateUpdateProfileForm(formData);

    expect(result.fieldErrors).toEqual({});
    expect(result.payload).toEqual({
      unitsPreference: "metric",
      displayName: null,
      gender: null,
      birthdate: null,
      heightCm: null,
    });
  });

  it("rejects missing unitsPreference", () => {
    const formData = makeFormData({
      unitsPreference: "",
    });

    const result = validateUpdateProfileForm(formData);

    expect(result.payload).toBeUndefined();
    expect(result.fieldErrors.unitsPreference).toBeDefined();
  });

  it("rejects invalid optional fields", () => {
    const formData = makeFormData({
      unitsPreference: "metric",
      gender: "unknown",
      birthdate: "10/05/1990",
      heightCm: "-5",
    });

    const result = validateUpdateProfileForm(formData);

    expect(result.payload).toBeUndefined();
    expect(result.fieldErrors.gender).toBeDefined();
    expect(result.fieldErrors.birthdate).toBeDefined();
    expect(result.fieldErrors.heightCm).toBeDefined();
  });

  it("does not include a username field error (username is not editable)", () => {
    const formData = makeFormData({
      unitsPreference: "metric",
    });

    const result = validateUpdateProfileForm(formData);

    expect(result.fieldErrors.username).toBeUndefined();
  });
});
