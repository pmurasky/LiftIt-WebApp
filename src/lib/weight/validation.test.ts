import { describe, expect, it } from "vitest";

import { validateBodyWeightEntryForm } from "@/lib/weight/validation";

function makeFormData(values: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}

describe("validateBodyWeightEntryForm", () => {
  it("accepts a valid payload", () => {
    const result = validateBodyWeightEntryForm(
      makeFormData({
        weight: "185.25",
        date: "2026-02-25",
      })
    );

    expect(result.fieldErrors).toEqual({});
    expect(result.payload).toEqual({
      weight: 185.25,
      date: "2026-02-25",
    });
  });

  it("rejects missing required fields", () => {
    const result = validateBodyWeightEntryForm(
      makeFormData({
        weight: "",
        date: "",
      })
    );

    expect(result.payload).toBeUndefined();
    expect(result.fieldErrors.weight).toBe("Weight is required.");
    expect(result.fieldErrors.date).toBe("Date is required.");
  });

  it("rejects non-positive weight", () => {
    const result = validateBodyWeightEntryForm(
      makeFormData({
        weight: "0",
        date: "2026-02-25",
      })
    );

    expect(result.payload).toBeUndefined();
    expect(result.fieldErrors.weight).toBe("Weight must be a positive number.");
  });

  it("rejects invalid calendar dates", () => {
    const result = validateBodyWeightEntryForm(
      makeFormData({
        weight: "182",
        date: "2026-02-30",
      })
    );

    expect(result.payload).toBeUndefined();
    expect(result.fieldErrors.date).toBe("Date must use the YYYY-MM-DD format.");
  });
});
