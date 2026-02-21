export function cmToInches(heightCm: number): number {
  return heightCm / 2.54;
}

export function inchesToCm(heightInches: number): number {
  return heightInches * 2.54;
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
