import { describe, expect, it } from "vitest";

import { validateCreateProfileForm } from "@/lib/profile/validation";

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
