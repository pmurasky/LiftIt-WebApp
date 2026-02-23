"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  type CreateProfileActionState,
  initialCreateProfileActionState,
} from "@/lib/profile/action-state";
import { createProfileAction } from "@/lib/profile/actions";
import { imperialHeightInputsToCm } from "@/lib/profile/height";

export function ProfileOnboardingForm() {
  const [state, formAction, isPending] = useActionState<CreateProfileActionState, FormData>(
    createProfileAction,
    initialCreateProfileActionState
  );
  const [heightFeetInput, setHeightFeetInput] = useState("");
  const [heightInchesInput, setHeightInchesInput] = useState("");

  const heightCmValue = useMemo(() => {
    return imperialHeightInputsToCm(heightFeetInput, heightInchesInput);
  }, [heightFeetInput, heightInchesInput]);

  return (
    <form action={formAction} className="mt-8 grid gap-5">
      <input type="hidden" name="unitsPreference" value="imperial" />

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
          className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="trainwithalex"
        />
        {state.fieldErrors.username ? (
          <p className="text-sm text-red-300">{state.fieldErrors.username}</p>
        ) : null}
      </div>

      <div className="grid gap-2 sm:max-w-xs">
        <p className="text-sm font-medium">Units Preference *</p>
        <p className="flex h-11 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
          Imperial (lb, ft/in)
        </p>
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
          className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Alex"
        />
        <p className="text-xs text-muted-foreground">How your name appears in the app.</p>
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
            className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
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
            className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
          />
          {state.fieldErrors.birthdate ? (
            <p className="text-sm text-red-300">{state.fieldErrors.birthdate}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2 sm:max-w-xs">
        <p className="text-sm font-medium">Height</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1">
            <label htmlFor="heightFeet" className="text-xs text-muted-foreground">
              Feet
            </label>
            <input
              id="heightFeet"
              inputMode="decimal"
              value={heightFeetInput}
              onChange={(event) => setHeightFeetInput(event.target.value)}
              className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="5"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="heightInches" className="text-xs text-muted-foreground">
              Inches
            </label>
            <input
              id="heightInches"
              inputMode="decimal"
              value={heightInchesInput}
              onChange={(event) => setHeightInchesInput(event.target.value)}
              className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="10"
            />
          </div>
        </div>
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
