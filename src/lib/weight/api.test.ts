import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/client";

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return {
    ...actual,
    authenticatedRequest: vi.fn(),
  };
});

import { authenticatedRequest } from "@/lib/api/client";
import { createBodyWeightEntry, getBodyWeightHistory } from "@/lib/weight/api";

describe("weight API (stub mode)", () => {
  it("throws 401 when fetching without stub key", async () => {
    await expect(getBodyWeightHistory()).rejects.toMatchObject({ status: 401 });
  });

  it("returns empty history for a new key", async () => {
    const result = await getBodyWeightHistory("auth0|new-history");

    expect(result).toEqual([]);
  });

  it("creates entry and returns newest-first history", async () => {
    const key = "auth0|weight-stub-1";

    await createBodyWeightEntry({ weight: 189.1, date: "2026-02-20" }, key);
    await createBodyWeightEntry({ weight: 188.4, date: "2026-02-24" }, key);

    const history = await getBodyWeightHistory(key);

    expect(history).toHaveLength(2);
    expect(history[0].date).toBe("2026-02-24");
    expect(history[1].date).toBe("2026-02-20");
    expect(authenticatedRequest).not.toHaveBeenCalled();
  });

  it("throws 401 when creating without stub key", async () => {
    await expect(createBodyWeightEntry({ weight: 180, date: "2026-02-25" })).rejects.toMatchObject({
      status: 401,
    });
  });
});

describe("weight API (real mode)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    vi.stubEnv("PROFILE_API_STUB", "false");
    vi.stubEnv("NODE_ENV", "production");
  });

  async function importRealApi() {
    return import("@/lib/weight/api");
  }

  it("calls GET /users/me/body-weight-history in real mode", async () => {
    const { authenticatedRequest: mockReq } = await import("@/lib/api/client");
    vi.mocked(mockReq).mockResolvedValue([]);
    const { getBodyWeightHistory: getHistory } = await importRealApi();

    await getHistory();

    expect(mockReq).toHaveBeenCalledWith("/users/me/body-weight-history", { method: "GET" });
  });

  it("calls POST /users/me/body-weight-history in real mode", async () => {
    const { authenticatedRequest: mockReq } = await import("@/lib/api/client");
    vi.mocked(mockReq).mockResolvedValue({
      id: "entry-1",
      weight: 180,
      date: "2026-02-25",
      createdAt: "2026-02-25T01:02:03.000Z",
    });
    const { createBodyWeightEntry: createEntry } = await importRealApi();
    const payload = { weight: 180, date: "2026-02-25" };

    await createEntry(payload);

    expect(mockReq).toHaveBeenCalledWith("/users/me/body-weight-history", {
      method: "POST",
      body: payload,
    });
  });

  it("propagates ApiError in real mode", async () => {
    const { authenticatedRequest: mockReq } = await import("@/lib/api/client");
    vi.mocked(mockReq).mockRejectedValue(new ApiError(503, "Service Unavailable"));
    const { getBodyWeightHistory: getHistory } = await importRealApi();

    await expect(getHistory()).rejects.toMatchObject({ status: 503 });
  });
});
