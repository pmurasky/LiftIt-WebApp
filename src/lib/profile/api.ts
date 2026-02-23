import { authenticatedRequest, ApiError } from "@/lib/api/client";

export type UnitsPreference = "metric" | "imperial";
export type Gender = "male" | "female" | "non_binary" | "prefer_not_to_say";

export interface UserProfile {
  username: string;
  unitsPreference: UnitsPreference;
  displayName: string | null;
  gender: Gender | null;
  birthdate: string | null;
  heightCm: number | null;
}

export interface CreateUserProfileRequest {
  username: string;
  unitsPreference: UnitsPreference;
  displayName?: string | null;
  gender?: Gender | null;
  birthdate?: string | null;
  heightCm?: number | null;
}

export interface UpdateUserProfileRequest {
  displayName?: string | null;
  gender?: Gender | null;
  birthdate?: string | null;
  heightCm?: number | null;
  unitsPreference?: UnitsPreference;
}

export interface ProvisionUserRequest {
  auth0Id: string;
  email: string;
}

const PROFILE_API_STUB =
  process.env.PROFILE_API_STUB === "true" ||
  (process.env.PROFILE_API_STUB !== "false" && process.env.NODE_ENV !== "production");
const stubProfilesByAuth0Id = new Map<string, UserProfile>();

function getStubProfile(auth0Id: string): UserProfile {
  const existingProfile = stubProfilesByAuth0Id.get(auth0Id);
  if (existingProfile) {
    return existingProfile;
  }

  throw new ApiError(404, "Profile not found", { message: "Profile not found" });
}

function updateStubProfile(auth0Id: string, payload: UpdateUserProfileRequest): UserProfile {
  const existing = stubProfilesByAuth0Id.get(auth0Id);
  if (!existing) {
    throw new ApiError(404, "Profile not found", { message: "Profile not found" });
  }

  const updated: UserProfile = {
    ...existing,
    ...(payload.unitsPreference !== undefined ? { unitsPreference: payload.unitsPreference } : {}),
    ...(payload.displayName !== undefined ? { displayName: payload.displayName } : {}),
    ...(payload.gender !== undefined ? { gender: payload.gender } : {}),
    ...(payload.birthdate !== undefined ? { birthdate: payload.birthdate } : {}),
    ...(payload.heightCm !== undefined ? { heightCm: payload.heightCm } : {}),
  };

  stubProfilesByAuth0Id.set(auth0Id, updated);
  return updated;
}

function createStubProfile(auth0Id: string, payload: CreateUserProfileRequest): UserProfile {
  if (stubProfilesByAuth0Id.has(auth0Id)) {
    throw new ApiError(409, "Profile already exists", {
      message: "Profile already exists",
    });
  }

  const profile: UserProfile = {
    username: payload.username,
    unitsPreference: payload.unitsPreference,
    displayName: payload.displayName ?? null,
    gender: payload.gender ?? null,
    birthdate: payload.birthdate ?? null,
    heightCm: payload.heightCm ?? null,
  };

  stubProfilesByAuth0Id.set(auth0Id, profile);
  return profile;
}

export async function provisionCurrentUser(payload: ProvisionUserRequest) {
  if (PROFILE_API_STUB) {
    return;
  }

  return await authenticatedRequest<void>("/users/me", {
    method: "POST",
    body: payload,
  });
}

export async function getUserProfile(stubKey?: string): Promise<UserProfile> {
  if (PROFILE_API_STUB) {
    if (!stubKey) throw new ApiError(401, "No active session");
    return getStubProfile(stubKey);
  }

  return await authenticatedRequest<UserProfile>("/users/me/profile", {
    method: "GET",
  });
}

export async function createUserProfile(
  payload: CreateUserProfileRequest,
  stubKey?: string
): Promise<UserProfile> {
  if (PROFILE_API_STUB) {
    if (!stubKey) throw new ApiError(401, "No active session");
    return createStubProfile(stubKey, payload);
  }

  return await authenticatedRequest<UserProfile>("/users/me/profile", {
    method: "POST",
    body: payload,
  });
}

export async function updateUserProfile(
  payload: UpdateUserProfileRequest,
  stubKey?: string
): Promise<UserProfile> {
  if (PROFILE_API_STUB) {
    if (!stubKey) throw new ApiError(401, "No active session");
    return updateStubProfile(stubKey, payload);
  }

  return await authenticatedRequest<UserProfile>("/users/me/profile", {
    method: "PATCH",
    body: payload,
  });
}
