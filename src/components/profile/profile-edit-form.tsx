"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  type UpdateProfileActionState,
  initialUpdateProfileActionState,
} from "@/lib/profile/action-state";
import { updateProfileAction } from "@/lib/profile/actions";
import type { UserProfile } from "@/lib/profile/api";
import { cmToInches, formatHeightForUnits, inchesToCm, toNumberOrNull } from "@/lib/profile/height";

interface ProfileEditFormProps {
  profile: UserProfile;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [state, formAction, isPending] = useActionState<UpdateProfileActionState, FormData>(
    updateProfileAction,
    initialUpdateProfileActionState
  );

  const [unitsPreference, setUnitsPreference] = useState<"metric" | "imperial">(
    profile.unitsPreference
  );
  const [heightInput, setHeightInput] = useState<string>(
    formatHeightForUnits(profile.heightCm, profile.unitsPreference)
  );

  // Keep height display in sync when units toggle
  function handleUnitsPreferenceChange(nextUnits: "metric" | "imperial") {
    if (nextUnits === unitsPreference) return;

    const numericHeight = toNumberOrNull(heightInput);
    if (numericHeight !== null) {
      const converted =
        nextUnits === "metric" ? inchesToCm(numericHeight) : cmToInches(numericHeight);
      setHeightInput((Math.round(converted * 10) / 10).toString());
    }
    setUnitsPreference(nextUnits);
  }

  const heightCmValue = useMemo(() => {
    const numericHeight = toNumberOrNull(heightInput);
    if (numericHeight === null) return "";
    const normalized =
      unitsPreference === "metric" ? numericHeight : inchesToCm(numericHeight);
    return String(Math.round(normalized * 100) / 100);
  }, [heightInput, unitsPreference]);

  return (
    <form action={formAction} className="mt-8 grid gap-5">
      {/* Username — read-only */}
      <div className="grid gap-2">
        <label className="text-sm font-medium">Username</label>
        <p className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
          {profile.username}
        </p>
        <p className="text-xs text-muted-foreground">Username cannot be changed.</p>
      </div>

      <div className="grid gap-2 sm:max-w-xs">
        <label htmlFor="unitsPreference" className="text-sm font-medium">
          Units Preference *
        </label>
        <select
          id="unitsPreference"
          name="unitsPreference"
          value={unitsPreference}
          onChange={(e) => handleUnitsPreferenceChange(e.target.value as "metric" | "imperial")}
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="metric">Metric</option>
          <option value="imperial">Imperial</option>
        </select>
        {state.fieldErrors.unitsPreference ? (
          <p className="text-sm text-red-300">{state.fieldErrors.unitsPreference}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label htmlFor="displayName" className="text-sm font-medium">
          Display Name
        </label>
        <input
          id="displayName"
          name="displayName"
          maxLength={100}
          defaultValue={profile.displayName ?? ""}
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Alex"
        />
        {state.fieldErrors.displayName ? (
          <p className="text-sm text-red-300">{state.fieldErrors.displayName}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="gender" className="text-sm font-medium">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            defaultValue={profile.gender ?? ""}
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Not specified</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non_binary">Non-binary</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
          {state.fieldErrors.gender ? (
            <p className="text-sm text-red-300">{state.fieldErrors.gender}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label htmlFor="birthdate" className="text-sm font-medium">
            Birthdate
          </label>
          <input
            id="birthdate"
            name="birthdate"
            type="date"
            defaultValue={profile.birthdate ?? ""}
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
          />
          {state.fieldErrors.birthdate ? (
            <p className="text-sm text-red-300">{state.fieldErrors.birthdate}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2 sm:max-w-xs">
        <label htmlFor="height" className="text-sm font-medium">
          Height ({unitsPreference === "metric" ? "cm" : "in"})
        </label>
        <input
          id="height"
          inputMode="decimal"
          value={heightInput}
          onChange={(e) => setHeightInput(e.target.value)}
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={unitsPreference === "metric" ? "178" : "70"}
        />
        <input type="hidden" name="heightCm" value={heightCmValue} />
        {state.fieldErrors.heightCm ? (
          <p className="text-sm text-red-300">{state.fieldErrors.heightCm}</p>
        ) : null}
      </div>

      {state.status === "success" && state.message ? (
        <p className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-200">
          {state.message}
        </p>
      ) : null}

      {state.status === "error" && state.message ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {state.message}
        </p>
      ) : null}

      <div className="pt-2">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
