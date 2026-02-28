import { authenticatedRequest, ApiError } from "@/lib/api/client";

export interface BodyWeightEntry {
  id: string;
  weight: number;
  date: string;
  createdAt: string;
}

export interface CreateBodyWeightEntryRequest {
  weight: number;
  date: string;
}

const PROFILE_API_STUB =
  process.env.PROFILE_API_STUB === "true" ||
  (process.env.PROFILE_API_STUB !== "false" && process.env.NODE_ENV !== "production");

const stubEntriesByAuth0Id = new Map<string, BodyWeightEntry[]>();

function compareEntriesNewestFirst(a: BodyWeightEntry, b: BodyWeightEntry) {
  return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
}

function buildStubId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `weight-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

export async function getBodyWeightHistory(stubKey?: string): Promise<BodyWeightEntry[]> {
  if (PROFILE_API_STUB) {
    if (!stubKey) {
      throw new ApiError(401, "No active session");
    }

    const entries = stubEntriesByAuth0Id.get(stubKey) ?? [];
    return [...entries].sort(compareEntriesNewestFirst);
  }

  const entries = await authenticatedRequest<BodyWeightEntry[]>("/users/me/body-weight-history", {
    method: "GET",
  });

  return [...entries].sort(compareEntriesNewestFirst);
}

export async function createBodyWeightEntry(
  payload: CreateBodyWeightEntryRequest,
  stubKey?: string
): Promise<BodyWeightEntry> {
  if (PROFILE_API_STUB) {
    if (!stubKey) {
      throw new ApiError(401, "No active session");
    }

    const nextEntry: BodyWeightEntry = {
      id: buildStubId(),
      weight: Math.round(payload.weight * 100) / 100,
      date: payload.date,
      createdAt: new Date().toISOString(),
    };

    const existingEntries = stubEntriesByAuth0Id.get(stubKey) ?? [];
    stubEntriesByAuth0Id.set(stubKey, [...existingEntries, nextEntry]);

    return nextEntry;
  }

  return await authenticatedRequest<BodyWeightEntry>("/users/me/body-weight-history", {
    method: "POST",
    body: payload,
  });
}
