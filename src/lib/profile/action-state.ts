import type { ProfileFieldName } from "@/lib/profile/validation";

export interface CreateProfileActionState {
  status: "idle" | "error";
  message?: string;
  fieldErrors: Partial<Record<ProfileFieldName, string>>;
}

export const initialCreateProfileActionState: CreateProfileActionState = {
  status: "idle",
  fieldErrors: {},
};

export interface UpdateProfileActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors: Partial<Record<ProfileFieldName, string>>;
}

export const initialUpdateProfileActionState: UpdateProfileActionState = {
  status: "idle",
  fieldErrors: {},
};
