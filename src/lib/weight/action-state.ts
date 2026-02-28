import type { BodyWeightEntry } from "@/lib/weight/api";
import type { BodyWeightFieldName } from "@/lib/weight/validation";

export interface BodyWeightActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors: Partial<Record<BodyWeightFieldName, string>>;
  savedEntry?: BodyWeightEntry;
}

export const initialBodyWeightActionState: BodyWeightActionState = {
  status: "idle",
  fieldErrors: {},
};
