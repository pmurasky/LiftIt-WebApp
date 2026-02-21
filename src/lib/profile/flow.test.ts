import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveProfileFlow } from "./flow";
import { ApiError } from "@/lib/api/client";

vi.mock("@/lib/auth0", () => ({
  auth0: {
    getSession: vi.fn(),
  },
}));

vi.mock("@/lib/profile/api", () => ({
  provisionCurrentUser: vi.fn(),
  getUserProfile: vi.fn(),
}));

import { auth0 } from "@/lib/auth0";
import { provisionCurrentUser, getUserProfile } from "@/lib/profile/api";

const mockSession = {
  user: { sub: "auth0|123", email: "user@example.com" },
  tokenSet: { accessToken: "token-abc" },
};

const mockProfile = {
  username: "lifter1",
  unitsPreference: "metric" as const,
  displayName: null,
  gender: null,
  birthdate: null,
  heightCm: null,
};

describe("resolveProfileFlow", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("unauthenticated states", () => {
    it("should return unauthenticated when there is no session", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(null as never);

      // When
      const result = await resolveProfileFlow();

      // Then
      expect(result).toEqual({ status: "unauthenticated" });
    });

    it("should return unauthenticated when session has no user", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue({
        tokenSet: { accessToken: "token-abc" },
      } as never);

      // When
      const result = await resolveProfileFlow();

      // Then
      expect(result).toEqual({ status: "unauthenticated" });
    });

    it("should return unauthenticated when session has no access token", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue({
        user: { sub: "auth0|123", email: "user@example.com" },
        tokenSet: {},
      } as never);

      // When
      const result = await resolveProfileFlow();

      // Then
      expect(result).toEqual({ status: "unauthenticated" });
    });

    it("should return unauthenticated when user has no sub", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue({
        user: { email: "user@example.com" },
        tokenSet: { accessToken: "token-abc" },
      } as never);

      // When
      const result = await resolveProfileFlow();

      // Then
      expect(result).toEqual({ status: "unauthenticated" });
    });

    it("should return unauthenticated when user has no email", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue({
        user: { sub: "auth0|123" },
        tokenSet: { accessToken: "token-abc" },
      } as never);

      // When
      const result = await resolveProfileFlow();

      // Then
      expect(result).toEqual({ status: "unauthenticated" });
    });
  });

  describe("ready state", () => {
    it("should return ready with profile when provisioning succeeds and profile exists", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(provisionCurrentUser).mockResolvedValue(undefined);
      vi.mocked(getUserProfile).mockResolvedValue(mockProfile);

      // When
      const result = await resolveProfileFlow();

      // Then
      expect(result).toEqual({ status: "ready", profile: mockProfile });
    });

    it("should return ready when provisioning returns 409 (user already exists)", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(provisionCurrentUser).mockRejectedValue(new ApiError(409, "Conflict"));
      vi.mocked(getUserProfile).mockResolvedValue(mockProfile);

      // When
      const result = await resolveProfileFlow();

      // Then
      expect(result).toEqual({ status: "ready", profile: mockProfile });
    });

    it("should pass the correct token and user info to provisionCurrentUser", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(provisionCurrentUser).mockResolvedValue(undefined);
      vi.mocked(getUserProfile).mockResolvedValue(mockProfile);

      // When
      await resolveProfileFlow();

      // Then
      expect(provisionCurrentUser).toHaveBeenCalledWith("token-abc", {
        auth0Id: "auth0|123",
        email: "user@example.com",
      });
    });

    it("should pass the correct token and auth0Id to getUserProfile", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(provisionCurrentUser).mockResolvedValue(undefined);
      vi.mocked(getUserProfile).mockResolvedValue(mockProfile);

      // When
      await resolveProfileFlow();

      // Then
      expect(getUserProfile).toHaveBeenCalledWith("token-abc", "auth0|123");
    });
  });

  describe("needs_onboarding state", () => {
    it("should return needs_onboarding when profile is not found", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(provisionCurrentUser).mockResolvedValue(undefined);
      vi.mocked(getUserProfile).mockRejectedValue(new ApiError(404, "Not Found"));

      // When
      const result = await resolveProfileFlow();

      // Then
      expect(result).toEqual({ status: "needs_onboarding" });
    });
  });

  describe("blocked states", () => {
    it("should return blocked when provisioning fails with a non-409 error", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(provisionCurrentUser).mockRejectedValue(
        new ApiError(500, "Internal Server Error")
      );

      // When
      const result = await resolveProfileFlow();

      // Then
      expect(result).toEqual({
        status: "blocked",
        message: "Internal Server Error",
      });
    });

    it("should return blocked with fallback message for non-Error provisioning failures", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(provisionCurrentUser).mockRejectedValue("string error");

      // When
      const result = await resolveProfileFlow();

      // Then
      expect(result).toEqual({
        status: "blocked",
        message: "Unable to provision your account right now.",
      });
    });

    it("should return blocked when getUserProfile fails with a non-404 error", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(provisionCurrentUser).mockResolvedValue(undefined);
      vi.mocked(getUserProfile).mockRejectedValue(
        new ApiError(503, "Service Unavailable")
      );

      // When
      const result = await resolveProfileFlow();

      // Then
      expect(result).toEqual({
        status: "blocked",
        message: "Service Unavailable",
      });
    });

    it("should return blocked with fallback message for non-Error profile fetch failures", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(provisionCurrentUser).mockResolvedValue(undefined);
      vi.mocked(getUserProfile).mockRejectedValue("string error");

      // When
      const result = await resolveProfileFlow();

      // Then
      expect(result).toEqual({
        status: "blocked",
        message: "Unable to load your profile right now.",
      });
    });
  });
});
