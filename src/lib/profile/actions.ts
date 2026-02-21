"use server";

import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api/client";
import { auth0 } from "@/lib/auth0";
import { type CreateProfileActionState, type UpdateProfileActionState } from "@/lib/profile/action-state";
import { createUserProfile, updateUserProfile } from "@/lib/profile/api";
import { validateCreateProfileForm, validateUpdateProfileForm } from "@/lib/profile/validation";

export async function createProfileAction(
  _previousState: CreateProfileActionState,
  formData: FormData
): Promise<CreateProfileActionState> {
  const session = await auth0.getSession();
  const auth0Id = session?.user.sub;

  if (!auth0Id) {
    redirect("/auth/login");
  }

  const validation = validateCreateProfileForm(formData);
  if (!validation.payload) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: validation.fieldErrors,
    };
  }

  try {
    await createUserProfile(validation.payload, auth0Id);
    redirect("/");
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      if (error.status === 409) {
        return {
          status: "error",
          message: "That username is already taken. Please choose a different one.",
          fieldErrors: {
            username: "Username already exists.",
          },
        };
      }

      return {
        status: "error",
        message: `Could not create profile: ${error.message}`,
        fieldErrors: {},
      };
    }

    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unexpected error creating profile.",
      fieldErrors: {},
    };
  }
}

export async function updateProfileAction(
  _previousState: UpdateProfileActionState,
  formData: FormData
): Promise<UpdateProfileActionState> {
  const session = await auth0.getSession();
  const auth0Id = session?.user.sub;

  if (!auth0Id) {
    redirect("/auth/login");
  }

  const validation = validateUpdateProfileForm(formData);
  if (!validation.payload) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: validation.fieldErrors,
    };
  }

  try {
    await updateUserProfile(validation.payload, auth0Id);
    return {
      status: "success",
      message: "Profile updated.",
      fieldErrors: {},
    };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return {
        status: "error",
        message: `Could not update profile: ${error.message}`,
        fieldErrors: {},
      };
    }

    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unexpected error updating profile.",
      fieldErrors: {},
    };
  }
}
