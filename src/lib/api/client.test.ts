import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiRequest } from "./client";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function makeResponse(
  status: number,
  body: unknown,
  ok: boolean = status >= 200 && status < 300
) {
  return {
    ok,
    status,
    statusText: "OK",
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(typeof body === "string" ? body : ""),
  };
}

describe("apiRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("successful responses", () => {
    it("should return parsed JSON when response is ok", async () => {
      // Given
      const payload = { id: 1, name: "Bench Press" };
      mockFetch.mockResolvedValue(makeResponse(200, payload));

      // When
      const result = await apiRequest<typeof payload>("/exercises/1");

      // Then
      expect(result).toEqual(payload);
    });

    it("should return undefined when response status is 204", async () => {
      // Given
      mockFetch.mockResolvedValue(makeResponse(204, null));

      // When
      const result = await apiRequest("/exercises/1", { method: "DELETE" });

      // Then
      expect(result).toBeUndefined();
    });

    it("should use GET method by default", async () => {
      // Given
      mockFetch.mockResolvedValue(makeResponse(200, {}));

      // When
      await apiRequest("/exercises");

      // Then
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should include Content-Type application/json header", async () => {
      // Given
      mockFetch.mockResolvedValue(makeResponse(200, {}));

      // When
      await apiRequest("/exercises");

      // Then
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should include Authorization header when token is provided", async () => {
      // Given
      mockFetch.mockResolvedValue(makeResponse(200, {}));

      // When
      await apiRequest("/exercises", { token: "test-token-abc" });

      // Then
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token-abc",
          }),
        })
      );
    });

    it("should omit Authorization header when no token is provided", async () => {
      // Given
      mockFetch.mockResolvedValue(makeResponse(200, {}));

      // When
      await apiRequest("/exercises");

      // Then
      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
      expect(options.headers).not.toHaveProperty("Authorization");
    });

    it("should serialize body to JSON when provided", async () => {
      // Given
      const body = { name: "Squat", sets: 3 };
      mockFetch.mockResolvedValue(makeResponse(201, { id: 2, ...body }));

      // When
      await apiRequest("/exercises", { method: "POST", body });

      // Then
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ body: JSON.stringify(body) })
      );
    });

    it("should omit body when undefined", async () => {
      // Given
      mockFetch.mockResolvedValue(makeResponse(200, {}));

      // When
      await apiRequest("/exercises");

      // Then
      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(options.body).toBeUndefined();
    });

    it("should prepend the API base path to the given path", async () => {
      // Given
      mockFetch.mockResolvedValue(makeResponse(200, {}));

      // When
      await apiRequest("/exercises/42");

      // Then
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/exercises/42"),
        expect.any(Object)
      );
    });
  });

  describe("error responses", () => {
    it("should throw an error with status and body text when response is not ok", async () => {
      // Given
      const errorResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: vi.fn().mockResolvedValue("Exercise not found"),
        json: vi.fn(),
      };
      mockFetch.mockResolvedValue(errorResponse);

      // When / Then
      await expect(apiRequest("/exercises/999")).rejects.toThrow(
        "API 404: Exercise not found"
      );
    });

    it("should fall back to statusText when error body is empty", async () => {
      // Given
      const errorResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: vi.fn().mockResolvedValue(""),
        json: vi.fn(),
      };
      mockFetch.mockResolvedValue(errorResponse);

      // When / Then
      await expect(apiRequest("/exercises")).rejects.toThrow(
        "API 500: Internal Server Error"
      );
    });

    it("should handle 401 Unauthorized responses", async () => {
      // Given
      const errorResponse = {
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: vi.fn().mockResolvedValue("Invalid or expired token"),
        json: vi.fn(),
      };
      mockFetch.mockResolvedValue(errorResponse);

      // When / Then
      await expect(
        apiRequest("/workouts", { token: "expired-token" })
      ).rejects.toThrow("API 401: Invalid or expired token");
    });

    it("should handle 403 Forbidden responses", async () => {
      // Given
      const errorResponse = {
        ok: false,
        status: 403,
        statusText: "Forbidden",
        text: vi
          .fn()
          .mockResolvedValue("You do not have access to this resource"),
        json: vi.fn(),
      };
      mockFetch.mockResolvedValue(errorResponse);

      // When / Then
      await expect(
        apiRequest("/admin/users", { token: "valid-token" })
      ).rejects.toThrow("API 403: You do not have access to this resource");
    });

    it("should handle network errors", async () => {
      // Given
      mockFetch.mockRejectedValue(new Error("Network error"));

      // When / Then
      await expect(apiRequest("/exercises")).rejects.toThrow("Network error");
    });
  });
});
