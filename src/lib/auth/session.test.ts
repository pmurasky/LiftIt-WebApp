import { describe, it, expect } from "vitest";
import { getAccessToken } from "./session";
import type { AuthSession } from "./session";

describe("getAccessToken", () => {
  it("should return the access token when a valid session is provided", () => {
    // Given
    const session: AuthSession = {
      accessToken: "eyJhbGciOiJSUzI1NiJ9.test",
      expiresAt: Date.now() + 3600 * 1000,
    };

    // When
    const result = getAccessToken(session);

    // Then
    expect(result).toBe("eyJhbGciOiJSUzI1NiJ9.test");
  });

  it("should return null when session is null", () => {
    // When
    const result = getAccessToken(null);

    // Then
    expect(result).toBeNull();
  });
});
