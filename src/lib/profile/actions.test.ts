import { describe, it, expect, vi, beforeEach } from "vitest";
import { createProfileAction, updateProfileAction } from "./actions";
import { ApiError } from "@/lib/api/client";
import { initialCreateProfileActionState, initialUpdateProfileActionState } from "./action-state";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth0", () => ({
  auth0: {
    getSession: vi.fn(),
  },
}));

vi.mock("@/lib/profile/api", () => ({
  createUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
}));

import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { createUserProfile, updateUserProfile } from "@/lib/profile/api";

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

function makeCreateFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("username", "lifter1");
  fd.set("unitsPreference", "metric");
  for (const [key, value] of Object.entries(overrides)) {
    fd.set(key, value);
  }
  return fd;
}

function makeUpdateFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("unitsPreference", "metric");
  for (const [key, value] of Object.entries(overrides)) {
    fd.set(key, value);
  }
  return fd;
}

describe("createProfileAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("authentication", () => {
    it("should redirect to /auth/login when there is no session", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(null as never);

      // When
      await createProfileAction(initialCreateProfileActionState, makeCreateFormData());

      // Then
      expect(redirect).toHaveBeenCalledWith("/auth/login");
    });

    it("should redirect to /auth/login when session has no access token", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue({
        user: { sub: "auth0|123" },
        tokenSet: {},
      } as never);

      // When
      await createProfileAction(initialCreateProfileActionState, makeCreateFormData());

      // Then
      expect(redirect).toHaveBeenCalledWith("/auth/login");
    });
  });

  describe("validation errors", () => {
    it("should return error state when username is missing", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      const fd = makeCreateFormData({ username: "" });

      // When
      const result = await createProfileAction(initialCreateProfileActionState, fd);

      // Then
      expect(result.status).toBe("error");
      expect(result.fieldErrors).toHaveProperty("username");
    });

    it("should return error state when unitsPreference is invalid", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      const fd = makeCreateFormData({ unitsPreference: "hands" });

      // When
      const result = await createProfileAction(initialCreateProfileActionState, fd);

      // Then
      expect(result.status).toBe("error");
      expect(result.fieldErrors).toHaveProperty("unitsPreference");
    });
  });

  describe("successful creation", () => {
    it("should redirect to / on successful profile creation", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(createUserProfile).mockResolvedValue(mockProfile);

      // When
      await createProfileAction(initialCreateProfileActionState, makeCreateFormData());

      // Then
      expect(redirect).toHaveBeenCalledWith("/");
    });

    it("should call createUserProfile with the token, payload, and auth0Id", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(createUserProfile).mockResolvedValue(mockProfile);

      // When
      await createProfileAction(initialCreateProfileActionState, makeCreateFormData());

      // Then
      expect(createUserProfile).toHaveBeenCalledWith(
        "token-abc",
        expect.objectContaining({ username: "lifter1", unitsPreference: "metric" }),
        "auth0|123"
      );
    });
  });

  describe("API errors", () => {
    it("should return username field error on 409 Conflict", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(createUserProfile).mockRejectedValue(new ApiError(409, "Conflict"));

      // When
      const result = await createProfileAction(
        initialCreateProfileActionState,
        makeCreateFormData()
      );

      // Then
      expect(result.status).toBe("error");
      expect(result.fieldErrors).toHaveProperty("username");
    });

    it("should return generic error state for other ApiError", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(createUserProfile).mockRejectedValue(new ApiError(500, "Server error"));

      // When
      const result = await createProfileAction(
        initialCreateProfileActionState,
        makeCreateFormData()
      );

      // Then
      expect(result.status).toBe("error");
      expect(result.message).toContain("Server error");
    });

    it("should return generic error state for non-ApiError", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(createUserProfile).mockRejectedValue(new Error("Network failure"));

      // When
      const result = await createProfileAction(
        initialCreateProfileActionState,
        makeCreateFormData()
      );

      // Then
      expect(result.status).toBe("error");
      expect(result.message).toBe("Network failure");
    });

    it("should return fallback message for unknown thrown values", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(createUserProfile).mockRejectedValue("unexpected string");

      // When
      const result = await createProfileAction(
        initialCreateProfileActionState,
        makeCreateFormData()
      );

      // Then
      expect(result.status).toBe("error");
      expect(result.message).toBe("Unexpected error creating profile.");
    });
  });
});

describe("updateProfileAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("authentication", () => {
    it("should redirect to /auth/login when there is no session", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(null as never);

      // When
      await updateProfileAction(initialUpdateProfileActionState, makeUpdateFormData());

      // Then
      expect(redirect).toHaveBeenCalledWith("/auth/login");
    });
  });

  describe("validation errors", () => {
    it("should return error state when unitsPreference is invalid", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      const fd = makeUpdateFormData({ unitsPreference: "stones" });

      // When
      const result = await updateProfileAction(initialUpdateProfileActionState, fd);

      // Then
      expect(result.status).toBe("error");
      expect(result.fieldErrors).toHaveProperty("unitsPreference");
    });
  });

  describe("successful update", () => {
    it("should return success state on successful profile update", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(updateUserProfile).mockResolvedValue(mockProfile);

      // When
      const result = await updateProfileAction(
        initialUpdateProfileActionState,
        makeUpdateFormData()
      );

      // Then
      expect(result.status).toBe("success");
    });

    it("should call updateUserProfile with the token, payload, and auth0Id", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(updateUserProfile).mockResolvedValue(mockProfile);

      // When
      await updateProfileAction(initialUpdateProfileActionState, makeUpdateFormData());

      // Then
      expect(updateUserProfile).toHaveBeenCalledWith(
        "token-abc",
        expect.objectContaining({ unitsPreference: "metric" }),
        "auth0|123"
      );
    });
  });

  describe("API errors", () => {
    it("should return error state for ApiError", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(updateUserProfile).mockRejectedValue(new ApiError(500, "Server error"));

      // When
      const result = await updateProfileAction(
        initialUpdateProfileActionState,
        makeUpdateFormData()
      );

      // Then
      expect(result.status).toBe("error");
      expect(result.message).toContain("Server error");
    });

    it("should return error state for non-ApiError", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(updateUserProfile).mockRejectedValue(new Error("Network failure"));

      // When
      const result = await updateProfileAction(
        initialUpdateProfileActionState,
        makeUpdateFormData()
      );

      // Then
      expect(result.status).toBe("error");
      expect(result.message).toBe("Network failure");
    });

    it("should return fallback message for unknown thrown values", async () => {
      // Given
      vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(updateUserProfile).mockRejectedValue("unexpected string");

      // When
      const result = await updateProfileAction(
        initialUpdateProfileActionState,
        makeUpdateFormData()
      );

      // Then
      expect(result.status).toBe("error");
      expect(result.message).toBe("Unexpected error updating profile.");
    });
  });
});
