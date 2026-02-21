import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "@/lib/api/client";

// Mock authenticatedRequest so real-mode tests don't hit the network or need a session.
vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return {
    ...actual,
    authenticatedRequest: vi.fn(),
  };
});

import { authenticatedRequest } from "@/lib/api/client";
import {
  provisionCurrentUser,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
} from "./api";

const AUTH0_ID = "auth0|stub-user";

const mockProfile = {
  username: "lifter1",
  unitsPreference: "metric" as const,
  displayName: "Lifter One",
  gender: null,
  birthdate: null,
  heightCm: 180,
};

// ---------------------------------------------------------------------------
// Stub mode tests (PROFILE_API_STUB is active in test environment by default)
// ---------------------------------------------------------------------------
describe("profile API (stub mode)", () => {
  // We rely on unique stubKey values per test to avoid in-memory Map state bleed.

  describe("provisionCurrentUser", () => {
    it("should resolve without calling authenticatedRequest", async () => {
      // When
      await provisionCurrentUser({ auth0Id: AUTH0_ID, email: "u@example.com" });

      // Then
      expect(authenticatedRequest).not.toHaveBeenCalled();
    });
  });

  describe("getUserProfile", () => {
    it("should throw 401 ApiError when no stub key is provided", async () => {
      // When / Then
      await expect(getUserProfile()).rejects.toMatchObject({ status: 401 });
    });

    it("should throw 404 ApiError when no profile has been created for the key", async () => {
      // When / Then
      await expect(getUserProfile("nonexistent-key")).rejects.toMatchObject({
        status: 404,
      });
    });

    it("should return a profile that was previously created", async () => {
      // Given
      const key = `${AUTH0_ID}-get-test`;
      await createUserProfile({ username: "lifter1", unitsPreference: "metric" }, key);

      // When
      const result = await getUserProfile(key);

      // Then
      expect(result.username).toBe("lifter1");
      expect(result.unitsPreference).toBe("metric");
    });
  });

  describe("createUserProfile", () => {
    it("should create and return a new profile with all fields", async () => {
      // Given
      const key = `${AUTH0_ID}-create-all`;
      const payload = {
        username: "lifter2",
        unitsPreference: "imperial" as const,
        displayName: "Lifter Two",
        gender: "male" as const,
        birthdate: "1990-06-15",
        heightCm: 175,
      };

      // When
      const result = await createUserProfile(payload, key);

      // Then
      expect(result).toMatchObject(payload);
    });

    it("should default nullable fields to null when not provided", async () => {
      // Given
      const key = `${AUTH0_ID}-create-minimal`;

      // When
      const result = await createUserProfile(
        { username: "minimaluser", unitsPreference: "metric" },
        key
      );

      // Then
      expect(result.displayName).toBeNull();
      expect(result.gender).toBeNull();
      expect(result.birthdate).toBeNull();
      expect(result.heightCm).toBeNull();
    });

    it("should throw 409 ApiError when a profile already exists for the key", async () => {
      // Given
      const key = `${AUTH0_ID}-create-duplicate`;
      await createUserProfile({ username: "once", unitsPreference: "metric" }, key);

      // When / Then
      await expect(
        createUserProfile({ username: "twice", unitsPreference: "metric" }, key)
      ).rejects.toMatchObject({ status: 409 });
    });

    it("should throw 401 ApiError when no stub key is provided", async () => {
      // When / Then
      await expect(
        createUserProfile({ username: "nokey", unitsPreference: "metric" })
      ).rejects.toMatchObject({ status: 401 });
    });

    it("should not call authenticatedRequest in stub mode", async () => {
      // When
      await createUserProfile(
        { username: "noapicall", unitsPreference: "metric" },
        `${AUTH0_ID}-no-api`
      );

      // Then
      expect(authenticatedRequest).not.toHaveBeenCalled();
    });
  });

  describe("updateUserProfile", () => {
    it("should update and return the modified profile", async () => {
      // Given
      const key = `${AUTH0_ID}-update-test`;
      await createUserProfile({ username: "updatable", unitsPreference: "metric" }, key);

      // When
      const result = await updateUserProfile(
        { displayName: "Updated Name", unitsPreference: "imperial" },
        key
      );

      // Then
      expect(result.displayName).toBe("Updated Name");
      expect(result.unitsPreference).toBe("imperial");
      expect(result.username).toBe("updatable");
    });

    it("should only apply provided fields (partial update)", async () => {
      // Given
      const key = `${AUTH0_ID}-partial-update`;
      await createUserProfile(
        {
          username: "partial",
          unitsPreference: "metric",
          displayName: "Original Name",
          heightCm: 160,
        },
        key
      );

      // When
      const result = await updateUserProfile({ heightCm: 170 }, key);

      // Then
      expect(result.heightCm).toBe(170);
      expect(result.displayName).toBe("Original Name"); // unchanged
    });

    it("should throw 404 ApiError when no profile exists for the key", async () => {
      // When / Then
      await expect(
        updateUserProfile({ displayName: "Ghost" }, "nonexistent-update-key")
      ).rejects.toMatchObject({ status: 404 });
    });

    it("should throw 401 ApiError when no stub key is provided", async () => {
      // When / Then
      await expect(
        updateUserProfile({ displayName: "Ghost" })
      ).rejects.toMatchObject({ status: 401 });
    });

    it("should not call authenticatedRequest in stub mode", async () => {
      // Given
      const key = `${AUTH0_ID}-update-no-api`;
      await createUserProfile({ username: "noapiupdate", unitsPreference: "metric" }, key);

      // When
      await updateUserProfile({ displayName: "X" }, key);

      // Then
      expect(authenticatedRequest).not.toHaveBeenCalled();
    });
  });
});

// ---------------------------------------------------------------------------
// Real API path tests (force PROFILE_API_STUB off by re-importing the module)
// ---------------------------------------------------------------------------
describe("profile API (real mode)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    vi.stubEnv("PROFILE_API_STUB", "false");
    vi.stubEnv("NODE_ENV", "production");
  });

  async function importRealApi() {
    return import("./api");
  }

  it("provisionCurrentUser should call POST /users/me via authenticatedRequest", async () => {
    // Given
    const { authenticatedRequest: mockReq } = await import("@/lib/api/client");
    vi.mocked(mockReq).mockResolvedValue(undefined);
    const { provisionCurrentUser: provision } = await importRealApi();

    // When
    await provision({ auth0Id: "auth0|abc", email: "real@example.com" });

    // Then
    expect(mockReq).toHaveBeenCalledWith("/users/me", {
      method: "POST",
      body: { auth0Id: "auth0|abc", email: "real@example.com" },
    });
  });

  it("getUserProfile should call GET /users/me/profile via authenticatedRequest", async () => {
    // Given
    const { authenticatedRequest: mockReq } = await import("@/lib/api/client");
    vi.mocked(mockReq).mockResolvedValue(mockProfile);
    const { getUserProfile: getProfile } = await importRealApi();

    // When
    const result = await getProfile();

    // Then
    expect(mockReq).toHaveBeenCalledWith("/users/me/profile", { method: "GET" });
    expect(result).toEqual(mockProfile);
  });

  it("createUserProfile should call POST /users/me/profile via authenticatedRequest", async () => {
    // Given
    const { authenticatedRequest: mockReq } = await import("@/lib/api/client");
    vi.mocked(mockReq).mockResolvedValue(mockProfile);
    const { createUserProfile: createProfile } = await importRealApi();
    const payload = { username: "realuser", unitsPreference: "metric" as const };

    // When
    const result = await createProfile(payload);

    // Then
    expect(mockReq).toHaveBeenCalledWith("/users/me/profile", {
      method: "POST",
      body: payload,
    });
    expect(result).toEqual(mockProfile);
  });

  it("updateUserProfile should call PATCH /users/me/profile via authenticatedRequest", async () => {
    // Given
    const { authenticatedRequest: mockReq } = await import("@/lib/api/client");
    vi.mocked(mockReq).mockResolvedValue(mockProfile);
    const { updateUserProfile: updateProfile } = await importRealApi();
    const payload = { displayName: "Real Update" };

    // When
    const result = await updateProfile(payload);

    // Then
    expect(mockReq).toHaveBeenCalledWith("/users/me/profile", {
      method: "PATCH",
      body: payload,
    });
    expect(result).toEqual(mockProfile);
  });

  it("getUserProfile should propagate ApiError from authenticatedRequest", async () => {
    // Given
    const { authenticatedRequest: mockReq } = await import("@/lib/api/client");
    vi.mocked(mockReq).mockRejectedValue(new ApiError(404, "Not Found"));
    const { getUserProfile: getProfile } = await importRealApi();

    // When / Then
    await expect(getProfile()).rejects.toMatchObject({ status: 404 });
  });
});
