export function cmToInches(heightCm: number): number {
  return heightCm / 2.54;
}

export function inchesToCm(heightInches: number): number {
  return heightInches * 2.54;
}

export interface ImperialHeightParts {
  feet: string;
  inches: string;
}

export function toNumberOrNull(value: string): number | null {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
}

export function formatHeightForUnits(
  heightCm: number | null,
  units: "metric" | "imperial"
): string {
  if (heightCm === null) return "";
  if (units === "metric") return String(Math.round(heightCm * 10) / 10);
  return String(Math.round(cmToInches(heightCm) * 10) / 10);
}

export function formatHeightForImperialParts(heightCm: number | null): ImperialHeightParts {
  if (heightCm === null) {
    return { feet: "", inches: "" };
  }

  const totalInches = cmToInches(heightCm);
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round((totalInches - feet * 12) * 10) / 10;

  if (inches >= 12) {
    feet += 1;
    inches = 0;
  }

  return {
    feet: String(feet),
    inches: String(inches),
  };
}

export function imperialHeightInputsToCm(feetInput: string, inchesInput: string): string {
  const normalizedFeet = feetInput.trim();
  const normalizedInches = inchesInput.trim();

  if (!normalizedFeet && !normalizedInches) {
    return "";
  }

  const feet = normalizedFeet ? toNumberOrNull(normalizedFeet) : 0;
  const inches = normalizedInches ? toNumberOrNull(normalizedInches) : 0;

  if (feet === null || inches === null) {
    return "";
  }

  return String(Math.round(inchesToCm(feet * 12 + inches) * 100) / 100);
}
