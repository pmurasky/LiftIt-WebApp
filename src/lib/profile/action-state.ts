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
