import type { CreateBodyWeightEntryRequest } from "@/lib/weight/api";

export type BodyWeightFieldName = "weight" | "date";

export interface BodyWeightValidationResult {
  payload?: CreateBodyWeightEntryRequest;
  fieldErrors: Partial<Record<BodyWeightFieldName, string>>;
}

function readOptionalText(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function isValidIsoDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return parsed.toISOString().slice(0, 10) === date;
}

export function validateBodyWeightEntryForm(formData: FormData): BodyWeightValidationResult {
  const fieldErrors: Partial<Record<BodyWeightFieldName, string>> = {};

  const weightRaw = readOptionalText(formData, "weight");
  const date = readOptionalText(formData, "date");

  let weight: number | undefined;

  if (!weightRaw) {
    fieldErrors.weight = "Weight is required.";
  } else {
    const parsedWeight = Number.parseFloat(weightRaw);
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      fieldErrors.weight = "Weight must be a positive number.";
    } else {
      weight = Math.round(parsedWeight * 100) / 100;
    }
  }

  if (!date) {
    fieldErrors.date = "Date is required.";
  } else if (!isValidIsoDate(date)) {
    fieldErrors.date = "Date must use the YYYY-MM-DD format.";
  }

  if (Object.keys(fieldErrors).length > 0 || weight === undefined || !date) {
    return { fieldErrors };
  }

  return {
    fieldErrors,
    payload: {
      weight,
      date,
    },
  };
}
