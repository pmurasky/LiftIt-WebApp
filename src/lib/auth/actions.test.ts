import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginAction, logoutAction } from "./actions";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import { redirect } from "next/navigation";

describe("Auth Actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("loginAction", () => {
    it("should redirect to /auth/login", async () => {
      // When
      await loginAction();

      // Then
      expect(redirect).toHaveBeenCalledWith("/auth/login");
    });
  });

  describe("logoutAction", () => {
    it("should redirect to /auth/logout", async () => {
      // When
      await logoutAction();

      // Then
      expect(redirect).toHaveBeenCalledWith("/auth/logout");
    });
  });
});
