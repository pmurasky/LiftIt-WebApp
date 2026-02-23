import { describe, expect, it } from "vitest";

import {
  cmToInches,
  formatHeightForImperialParts,
  formatHeightForUnits,
  imperialHeightInputsToCm,
  inchesToCm,
  toNumberOrNull,
} from "@/lib/profile/height";

describe("cmToInches", () => {
  it("converts centimetres to inches", () => {
    expect(cmToInches(2.54)).toBeCloseTo(1);
    expect(cmToInches(177.8)).toBeCloseTo(70);
  });
});

describe("inchesToCm", () => {
  it("converts inches to centimetres", () => {
    expect(inchesToCm(1)).toBeCloseTo(2.54);
    expect(inchesToCm(70)).toBeCloseTo(177.8);
  });

  it("is the inverse of cmToInches", () => {
    expect(inchesToCm(cmToInches(178))).toBeCloseTo(178);
  });
});

describe("toNumberOrNull", () => {
  it("parses a valid numeric string", () => {
    expect(toNumberOrNull("178")).toBe(178);
    expect(toNumberOrNull("70.5")).toBe(70.5);
  });

  it("returns null for empty string", () => {
    expect(toNumberOrNull("")).toBeNull();
  });

  it("returns null for non-numeric strings", () => {
    expect(toNumberOrNull("abc")).toBeNull();
    expect(toNumberOrNull("1e999")).toBeNull(); // Infinity
  });
});

describe("formatHeightForUnits", () => {
  it("returns empty string when heightCm is null", () => {
    expect(formatHeightForUnits(null, "metric")).toBe("");
    expect(formatHeightForUnits(null, "imperial")).toBe("");
  });

  it("returns rounded cm string for metric", () => {
    expect(formatHeightForUnits(177.8, "metric")).toBe("177.8");
    expect(formatHeightForUnits(178.0, "metric")).toBe("178");
  });

  it("returns rounded inches string for imperial", () => {
    // 177.8 cm ≈ 70.0 in
    expect(formatHeightForUnits(177.8, "imperial")).toBe("70");
  });
});

describe("formatHeightForImperialParts", () => {
  it("returns blank parts for null height", () => {
    expect(formatHeightForImperialParts(null)).toEqual({ feet: "", inches: "" });
  });

  it("formats cm into feet and inches", () => {
    expect(formatHeightForImperialParts(177.8)).toEqual({ feet: "5", inches: "10" });
    expect(formatHeightForImperialParts(180)).toEqual({ feet: "5", inches: "10.9" });
  });
});

describe("imperialHeightInputsToCm", () => {
  it("converts feet and inches strings to cm", () => {
    expect(imperialHeightInputsToCm("5", "10")).toBe("177.8");
    expect(imperialHeightInputsToCm("6", "0")).toBe("182.88");
  });

  it("returns empty string for fully blank inputs", () => {
    expect(imperialHeightInputsToCm("", "")).toBe("");
  });

  it("returns empty string when either input is invalid", () => {
    expect(imperialHeightInputsToCm("five", "10")).toBe("");
    expect(imperialHeightInputsToCm("5", "ten")).toBe("");
  });
});
