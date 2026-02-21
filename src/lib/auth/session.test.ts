import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAccessToken } from "./session";

// Mock the auth0 singleton so tests never hit the network or require env vars.
vi.mock("../auth0", () => ({
  auth0: {
    getSession: vi.fn(),
  },
}));

import { auth0 } from "../auth0";

describe("getAccessToken", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return the access token when an active session exists", async () => {
    // Given
    vi.mocked(auth0.getSession).mockResolvedValue({
      tokenSet: { accessToken: "eyJhbGciOiJSUzI1NiJ9.test" },
    } as never);

    // When
    const result = await getAccessToken();

    // Then
    expect(result).toBe("eyJhbGciOiJSUzI1NiJ9.test");
  });

  it("should return null when there is no active session", async () => {
    // Given
    vi.mocked(auth0.getSession).mockResolvedValue(null as never);

    // When
    const result = await getAccessToken();

    // Then
    expect(result).toBeNull();
  });
});
