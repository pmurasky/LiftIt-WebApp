import { apiRequest, ApiError } from "@/lib/api/client";

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

export async function provisionCurrentUser(token: string, payload: ProvisionUserRequest) {
  return await apiRequest<void>("/users/me", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function getUserProfile(token: string, stubProfileKey?: string): Promise<UserProfile> {
  if (PROFILE_API_STUB) {
    return getStubProfile(stubProfileKey ?? token);
  }

  return await apiRequest<UserProfile>("/users/me/profile", {
    method: "GET",
    token,
  });
}

export async function createUserProfile(
  token: string,
  payload: CreateUserProfileRequest,
  stubProfileKey?: string
): Promise<UserProfile> {
  if (PROFILE_API_STUB) {
    return createStubProfile(stubProfileKey ?? token, payload);
  }

  return await apiRequest<UserProfile>("/users/me/profile", {
    method: "POST",
    token,
    body: payload,
  });
}
