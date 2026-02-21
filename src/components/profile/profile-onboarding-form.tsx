"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  type CreateProfileActionState,
  initialCreateProfileActionState,
} from "@/lib/profile/action-state";
import { createProfileAction } from "@/lib/profile/actions";
import { cmToInches, inchesToCm, toNumberOrNull } from "@/lib/profile/height";

export function ProfileOnboardingForm() {
  const [state, formAction, isPending] = useActionState<CreateProfileActionState, FormData>(
    createProfileAction,
    initialCreateProfileActionState
  );
  const [unitsPreference, setUnitsPreference] = useState<"metric" | "imperial">("metric");
  const [heightInput, setHeightInput] = useState("");

  const heightCmValue = useMemo(() => {
    const numericHeight = toNumberOrNull(heightInput);
    if (numericHeight === null) {
      return "";
    }

    const normalizedHeight =
      unitsPreference === "metric" ? numericHeight : inchesToCm(numericHeight);
    return String(Math.round(normalizedHeight * 100) / 100);
  }, [heightInput, unitsPreference]);

  function handleUnitsPreferenceChange(nextUnits: "metric" | "imperial") {
    if (nextUnits === unitsPreference) {
      return;
    }

    const numericHeight = toNumberOrNull(heightInput);
    if (numericHeight === null) {
      setUnitsPreference(nextUnits);
      return;
    }

    const convertedHeight =
      nextUnits === "metric" ? inchesToCm(numericHeight) : cmToInches(numericHeight);
    setUnitsPreference(nextUnits);
    setHeightInput((Math.round(convertedHeight * 10) / 10).toString());
  }

  return (
    <form action={formAction} className="mt-8 grid gap-5">
      <div className="grid gap-2">
        <label htmlFor="username" className="text-sm font-medium">
          Username *
        </label>
        <input
          id="username"
          name="username"
          required
          minLength={1}
          maxLength={30}
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="trainwithalex"
        />
        {state.fieldErrors.username ? (
          <p className="text-sm text-red-300">{state.fieldErrors.username}</p>
        ) : null}
      </div>

      <div className="grid gap-2 sm:max-w-xs">
        <label htmlFor="unitsPreference" className="text-sm font-medium">
          Units Preference *
        </label>
        <select
          id="unitsPreference"
          name="unitsPreference"
          value={unitsPreference}
          onChange={(event) =>
            handleUnitsPreferenceChange(event.target.value as "metric" | "imperial")
          }
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
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue=""
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
          onChange={(event) => setHeightInput(event.target.value)}
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={unitsPreference === "metric" ? "178" : "70"}
        />
        <input type="hidden" name="heightCm" value={heightCmValue} />
        {state.fieldErrors.heightCm ? (
          <p className="text-sm text-red-300">{state.fieldErrors.heightCm}</p>
        ) : null}
      </div>

      {state.status === "error" && state.message ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {state.message}
        </p>
      ) : null}

      <div className="pt-2">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Creating profile..." : "Create Profile"}
        </Button>
      </div>
    </form>
  );
}
