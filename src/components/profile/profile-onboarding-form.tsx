"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  formControlClassName,
  formErrorMessageClass,
  formFieldErrorClass,
  formHelperTextClass,
  formLayoutClass,
  formReadonlyValueClass,
} from "@/components/ui/form-primitives";
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
    <form action={formAction} className={formLayoutClass}>
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
          className={formControlClassName(Boolean(state.fieldErrors.username))}
          aria-invalid={Boolean(state.fieldErrors.username)}
          placeholder="trainwithalex"
        />
        {state.fieldErrors.username ? (
          <p className={formFieldErrorClass}>{state.fieldErrors.username}</p>
        ) : null}
      </div>

      <div className="grid gap-2 sm:max-w-xs">
        <p className="text-sm font-medium">Units Preference *</p>
        <p className={formReadonlyValueClass}>
          Imperial (lb, ft/in)
        </p>
        {state.fieldErrors.unitsPreference ? (
          <p className={formFieldErrorClass}>{state.fieldErrors.unitsPreference}</p>
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
          className={formControlClassName(Boolean(state.fieldErrors.displayName))}
          aria-invalid={Boolean(state.fieldErrors.displayName)}
          placeholder="Alex"
        />
        <p className={formHelperTextClass}>How your name appears in the app.</p>
        {state.fieldErrors.displayName ? (
          <p className={formFieldErrorClass}>{state.fieldErrors.displayName}</p>
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
            className={formControlClassName(Boolean(state.fieldErrors.gender))}
            aria-invalid={Boolean(state.fieldErrors.gender)}
            defaultValue=""
          >
            <option value="">Not specified</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non_binary">Non-binary</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
          {state.fieldErrors.gender ? (
            <p className={formFieldErrorClass}>{state.fieldErrors.gender}</p>
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
            className={formControlClassName(Boolean(state.fieldErrors.birthdate))}
            aria-invalid={Boolean(state.fieldErrors.birthdate)}
          />
          {state.fieldErrors.birthdate ? (
            <p className={formFieldErrorClass}>{state.fieldErrors.birthdate}</p>
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
              className={formControlClassName(Boolean(state.fieldErrors.heightCm))}
              aria-invalid={Boolean(state.fieldErrors.heightCm)}
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
              className={formControlClassName(Boolean(state.fieldErrors.heightCm))}
              aria-invalid={Boolean(state.fieldErrors.heightCm)}
              placeholder="10"
            />
          </div>
        </div>
        <input type="hidden" name="heightCm" value={heightCmValue} />
        {state.fieldErrors.heightCm ? (
          <p className={formFieldErrorClass}>{state.fieldErrors.heightCm}</p>
        ) : null}
      </div>

      {state.status === "error" && state.message ? (
        <p className={formErrorMessageClass}>
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
