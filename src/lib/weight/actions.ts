"use server";

import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api/client";
import { auth0 } from "@/lib/auth0";
import { type BodyWeightActionState } from "@/lib/weight/action-state";
import { createBodyWeightEntry } from "@/lib/weight/api";
import { validateBodyWeightEntryForm } from "@/lib/weight/validation";

export async function createBodyWeightEntryAction(
  _previousState: BodyWeightActionState,
  formData: FormData
): Promise<BodyWeightActionState> {
  const session = await auth0.getSession();
  const auth0Id = session?.user.sub;

  if (!auth0Id) {
    redirect("/auth/login");
  }

  const validation = validateBodyWeightEntryForm(formData);
  if (!validation.payload) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: validation.fieldErrors,
    };
  }

  try {
    const savedEntry = await createBodyWeightEntry(validation.payload, auth0Id);
    return {
      status: "success",
      message: "Weight entry saved.",
      fieldErrors: {},
      savedEntry,
    };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return {
        status: "error",
        message: `Could not save weight entry: ${error.message}`,
        fieldErrors: {},
      };
    }

    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unexpected error saving weight entry.",
      fieldErrors: {},
    };
  }
}
