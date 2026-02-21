import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "@/lib/api/client";

// Mock apiRequest so we can test the real API paths without network calls.
vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return {
    ...actual,
    apiRequest: vi.fn(),
  };
});

import { apiRequest } from "@/lib/api/client";
import {
  provisionCurrentUser,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
} from "./api";

const TOKEN = "test-token";
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
  // Each describe block gets a fresh module so the in-memory stub Map is reset.
  // We rely on the unique stubProfileKey per test to avoid state bleed.

  describe("provisionCurrentUser", () => {
    it("should resolve without calling apiRequest", async () => {
      // When
      await provisionCurrentUser(TOKEN, { auth0Id: AUTH0_ID, email: "u@example.com" });

      // Then
      expect(apiRequest).not.toHaveBeenCalled();
    });
  });

  describe("getUserProfile", () => {
    it("should throw 404 ApiError when no profile has been created for the key", async () => {
      // When / Then
      await expect(getUserProfile(TOKEN, "nonexistent-key")).rejects.toMatchObject({
        status: 404,
      });
    });

    it("should return a profile that was previously created", async () => {
      // Given
      const key = `${AUTH0_ID}-get-test`;
      await createUserProfile(
        TOKEN,
        { username: "lifter1", unitsPreference: "metric" },
        key
      );

      // When
      const result = await getUserProfile(TOKEN, key);

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
      const result = await createUserProfile(TOKEN, payload, key);

      // Then
      expect(result).toMatchObject(payload);
    });

    it("should default nullable fields to null when not provided", async () => {
      // Given
      const key = `${AUTH0_ID}-create-minimal`;

      // When
      const result = await createUserProfile(
        TOKEN,
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
      await createUserProfile(TOKEN, { username: "once", unitsPreference: "metric" }, key);

      // When / Then
      await expect(
        createUserProfile(TOKEN, { username: "twice", unitsPreference: "metric" }, key)
      ).rejects.toMatchObject({ status: 409 });
    });

    it("should not call apiRequest in stub mode", async () => {
      // When
      await createUserProfile(
        TOKEN,
        { username: "noapicall", unitsPreference: "metric" },
        `${AUTH0_ID}-no-api`
      );

      // Then
      expect(apiRequest).not.toHaveBeenCalled();
    });
  });

  describe("updateUserProfile", () => {
    it("should update and return the modified profile", async () => {
      // Given
      const key = `${AUTH0_ID}-update-test`;
      await createUserProfile(TOKEN, { username: "updatable", unitsPreference: "metric" }, key);

      // When
      const result = await updateUserProfile(
        TOKEN,
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
        TOKEN,
        {
          username: "partial",
          unitsPreference: "metric",
          displayName: "Original Name",
          heightCm: 160,
        },
        key
      );

      // When
      const result = await updateUserProfile(TOKEN, { heightCm: 170 }, key);

      // Then
      expect(result.heightCm).toBe(170);
      expect(result.displayName).toBe("Original Name"); // unchanged
    });

    it("should throw 404 ApiError when no profile exists for the key", async () => {
      // When / Then
      await expect(
        updateUserProfile(TOKEN, { displayName: "Ghost" }, "nonexistent-update-key")
      ).rejects.toMatchObject({ status: 404 });
    });

    it("should not call apiRequest in stub mode", async () => {
      // Given
      const key = `${AUTH0_ID}-update-no-api`;
      await createUserProfile(TOKEN, { username: "noapiupdate", unitsPreference: "metric" }, key);

      // When
      await updateUserProfile(TOKEN, { displayName: "X" }, key);

      // Then
      expect(apiRequest).not.toHaveBeenCalled();
    });
  });
});

// ---------------------------------------------------------------------------
// Real API path tests (force PROFILE_API_STUB off by mocking the env var
// and re-importing the module)
// ---------------------------------------------------------------------------
describe("profile API (real mode)", () => {
  // We cannot easily toggle the module-level PROFILE_API_STUB const without
  // re-importing the module. Use vi.resetModules + dynamic import per test.

  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    vi.stubEnv("PROFILE_API_STUB", "false");
    vi.stubEnv("NODE_ENV", "production");
  });

  async function importRealApi() {
    const mod = await import("./api");
    return mod;
  }

  it("provisionCurrentUser should call POST /users/me with token and payload", async () => {
    // Given
    const { apiRequest: mockApiReq } = await import("@/lib/api/client");
    vi.mocked(mockApiReq).mockResolvedValue(undefined);
    const { provisionCurrentUser: provision } = await importRealApi();

    // When
    await provision(TOKEN, { auth0Id: "auth0|abc", email: "real@example.com" });

    // Then
    expect(mockApiReq).toHaveBeenCalledWith("/users/me", {
      method: "POST",
      token: TOKEN,
      body: { auth0Id: "auth0|abc", email: "real@example.com" },
    });
  });

  it("getUserProfile should call GET /users/me/profile with token", async () => {
    // Given
    const { apiRequest: mockApiReq } = await import("@/lib/api/client");
    vi.mocked(mockApiReq).mockResolvedValue(mockProfile);
    const { getUserProfile: getProfile } = await importRealApi();

    // When
    const result = await getProfile(TOKEN);

    // Then
    expect(mockApiReq).toHaveBeenCalledWith("/users/me/profile", {
      method: "GET",
      token: TOKEN,
    });
    expect(result).toEqual(mockProfile);
  });

  it("createUserProfile should call POST /users/me/profile with token and payload", async () => {
    // Given
    const { apiRequest: mockApiReq } = await import("@/lib/api/client");
    vi.mocked(mockApiReq).mockResolvedValue(mockProfile);
    const { createUserProfile: createProfile } = await importRealApi();
    const payload = { username: "realuser", unitsPreference: "metric" as const };

    // When
    const result = await createProfile(TOKEN, payload);

    // Then
    expect(mockApiReq).toHaveBeenCalledWith("/users/me/profile", {
      method: "POST",
      token: TOKEN,
      body: payload,
    });
    expect(result).toEqual(mockProfile);
  });

  it("updateUserProfile should call PATCH /users/me/profile with token and payload", async () => {
    // Given
    const { apiRequest: mockApiReq } = await import("@/lib/api/client");
    vi.mocked(mockApiReq).mockResolvedValue(mockProfile);
    const { updateUserProfile: updateProfile } = await importRealApi();
    const payload = { displayName: "Real Update" };

    // When
    const result = await updateProfile(TOKEN, payload);

    // Then
    expect(mockApiReq).toHaveBeenCalledWith("/users/me/profile", {
      method: "PATCH",
      token: TOKEN,
      body: payload,
    });
    expect(result).toEqual(mockProfile);
  });

  it("getUserProfile should propagate ApiError from apiRequest", async () => {
    // Given
    const { apiRequest: mockApiReq } = await import("@/lib/api/client");
    vi.mocked(mockApiReq).mockRejectedValue(new ApiError(404, "Not Found"));
    const { getUserProfile: getProfile } = await importRealApi();

    // When / Then
    await expect(getProfile(TOKEN)).rejects.toMatchObject({ status: 404 });
  });
});
