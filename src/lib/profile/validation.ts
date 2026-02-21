import type { CreateUserProfileRequest, Gender, UnitsPreference, UpdateUserProfileRequest } from "@/lib/profile/api";

export interface UpdateProfileValidationResult {
  payload?: UpdateUserProfileRequest;
  fieldErrors: Partial<Record<ProfileFieldName, string>>;
}

export interface ProfileValidationResult {
  payload?: CreateUserProfileRequest;
  fieldErrors: Partial<Record<ProfileFieldName, string>>;
}

export type ProfileFieldName =
  | "username"
  | "unitsPreference"
  | "displayName"
  | "gender"
  | "birthdate"
  | "heightCm";

const GENDER_OPTIONS: ReadonlySet<Gender> = new Set([
  "male",
  "female",
  "non_binary",
  "prefer_not_to_say",
]);

const UNIT_OPTIONS: ReadonlySet<UnitsPreference> = new Set(["metric", "imperial"]);

function readOptionalText(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

export function validateCreateProfileForm(formData: FormData): ProfileValidationResult {
  const fieldErrors: Partial<Record<ProfileFieldName, string>> = {};

  const username = readOptionalText(formData, "username");
  const unitsPreferenceRaw = readOptionalText(formData, "unitsPreference");
  const displayName = readOptionalText(formData, "displayName");
  const genderRaw = readOptionalText(formData, "gender");
  const birthdate = readOptionalText(formData, "birthdate");
  const heightCmRaw = readOptionalText(formData, "heightCm");

  if (!username) {
    fieldErrors.username = "Username is required.";
  } else if (username.length < 1 || username.length > 30) {
    fieldErrors.username = "Username must be between 1 and 30 characters.";
  }

  if (!unitsPreferenceRaw || !UNIT_OPTIONS.has(unitsPreferenceRaw as UnitsPreference)) {
    fieldErrors.unitsPreference = "Units preference must be metric or imperial.";
  }

  if (displayName && displayName.length > 100) {
    fieldErrors.displayName = "Display name cannot exceed 100 characters.";
  }

  if (genderRaw && !GENDER_OPTIONS.has(genderRaw as Gender)) {
    fieldErrors.gender = "Please select a valid gender option.";
  }

  if (birthdate && !/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
    fieldErrors.birthdate = "Birthdate must use the YYYY-MM-DD format.";
  }

  let heightCm: number | null = null;
  if (heightCmRaw) {
    const parsedHeight = Number.parseFloat(heightCmRaw);
    if (!Number.isFinite(parsedHeight) || parsedHeight <= 0 || parsedHeight > 300) {
      fieldErrors.heightCm = "Height must be a number between 0 and 300 cm.";
    } else {
      heightCm = Math.round(parsedHeight * 100) / 100;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    fieldErrors,
    payload: {
      username: username as string,
      unitsPreference: unitsPreferenceRaw as UnitsPreference,
      displayName,
      gender: (genderRaw as Gender | null) ?? null,
      birthdate,
      heightCm,
    },
  };
}

export function validateUpdateProfileForm(formData: FormData): UpdateProfileValidationResult {
  const fieldErrors: Partial<Record<ProfileFieldName, string>> = {};

  const unitsPreferenceRaw = readOptionalText(formData, "unitsPreference");
  const displayName = readOptionalText(formData, "displayName");
  const genderRaw = readOptionalText(formData, "gender");
  const birthdate = readOptionalText(formData, "birthdate");
  const heightCmRaw = readOptionalText(formData, "heightCm");

  if (!unitsPreferenceRaw || !UNIT_OPTIONS.has(unitsPreferenceRaw as UnitsPreference)) {
    fieldErrors.unitsPreference = "Units preference must be metric or imperial.";
  }

  if (displayName && displayName.length > 100) {
    fieldErrors.displayName = "Display name cannot exceed 100 characters.";
  }

  if (genderRaw && !GENDER_OPTIONS.has(genderRaw as Gender)) {
    fieldErrors.gender = "Please select a valid gender option.";
  }

  if (birthdate && !/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
    fieldErrors.birthdate = "Birthdate must use the YYYY-MM-DD format.";
  }

  let heightCm: number | null = null;
  if (heightCmRaw) {
    const parsedHeight = Number.parseFloat(heightCmRaw);
    if (!Number.isFinite(parsedHeight) || parsedHeight <= 0 || parsedHeight > 300) {
      fieldErrors.heightCm = "Height must be a number between 0 and 300 cm.";
    } else {
      heightCm = Math.round(parsedHeight * 100) / 100;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    fieldErrors,
    payload: {
      unitsPreference: unitsPreferenceRaw as UnitsPreference,
      displayName,
      gender: (genderRaw as Gender | null) ?? null,
      birthdate,
      heightCm,
    },
  };
}
