import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiRequest, ApiError } from "./client";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function makeResponse(
  status: number,
  body: unknown,
  ok: boolean = status >= 200 && status < 300,
  contentType: string = "application/json"
) {
  return {
    ok,
    status,
    statusText: "OK",
    headers: {
      get: vi.fn((header: string) =>
        header.toLowerCase() === "content-type" ? contentType : null
      ),
    },
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
    it("should throw ApiError with status and message for text responses", async () => {
      // Given
      mockFetch.mockResolvedValue(
        makeResponse(404, "Exercise not found", false, "text/plain")
      );

      // When / Then
      try {
        await apiRequest("/exercises/999");
        expect.fail("Should have thrown ApiError");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(404);
        expect((error as ApiError).message).toBe("Exercise not found");
        expect((error as ApiError).isNotFound).toBe(true);
      }
    });

    it("should throw ApiError with JSON error body", async () => {
      // Given
      const errorBody = { message: "Validation failed", field: "name" };
      mockFetch.mockResolvedValue(
        makeResponse(400, errorBody, false, "application/json")
      );

      // When / Then
      try {
        await apiRequest("/exercises");
        expect.fail("Should have thrown ApiError");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(400);
        expect((error as ApiError).message).toBe("Validation failed");
        expect((error as ApiError).body).toEqual(errorBody);
        expect((error as ApiError).isClientError).toBe(true);
      }
    });

    it("should fall back to statusText when error body is empty", async () => {
      // Given
      mockFetch.mockResolvedValue(
        makeResponse(500, "", false, "text/plain")
      );

      // When / Then
      try {
        await apiRequest("/exercises");
        expect.fail("Should have thrown ApiError");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(500);
        expect((error as ApiError).message).toBe("OK");
        expect((error as ApiError).isServerError).toBe(true);
      }
    });

    it("should handle 401 Unauthorized responses", async () => {
      // Given
      mockFetch.mockResolvedValue(
        makeResponse(401, "Invalid or expired token", false, "text/plain")
      );

      // When / Then
      try {
        await apiRequest("/workouts", { token: "expired-token" });
        expect.fail("Should have thrown ApiError");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(401);
        expect((error as ApiError).isUnauthorized).toBe(true);
      }
    });

    it("should handle 403 Forbidden responses", async () => {
      // Given
      mockFetch.mockResolvedValue(
        makeResponse(403, "You do not have access to this resource", false, "text/plain")
      );

      // When / Then
      try {
        await apiRequest("/admin/users", { token: "valid-token" });
        expect.fail("Should have thrown ApiError");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(403);
        expect((error as ApiError).isForbidden).toBe(true);
      }
    });

    it("should handle network errors", async () => {
      // Given
      mockFetch.mockRejectedValue(new Error("Network error"));

      // When / Then
      await expect(apiRequest("/exercises")).rejects.toThrow("Network error");
    });
  });
});
