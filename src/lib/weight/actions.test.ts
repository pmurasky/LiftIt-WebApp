import { beforeEach, describe, expect, it, vi } from "vitest";

import { initialBodyWeightActionState } from "@/lib/weight/action-state";
import { createBodyWeightEntryAction } from "@/lib/weight/actions";
import { ApiError } from "@/lib/api/client";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth0", () => ({
  auth0: {
    getSession: vi.fn(),
  },
}));

vi.mock("@/lib/weight/api", () => ({
  createBodyWeightEntry: vi.fn(),
}));

import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { createBodyWeightEntry } from "@/lib/weight/api";

const mockSession = {
  user: { sub: "auth0|123", email: "user@example.com" },
  tokenSet: { accessToken: "token-abc" },
};

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("weight", "185.2");
  fd.set("date", "2026-02-25");
  for (const [key, value] of Object.entries(overrides)) {
    fd.set(key, value);
  }
  return fd;
}

describe("createBodyWeightEntryAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("redirects to login when no session exists", async () => {
    vi.mocked(auth0.getSession).mockResolvedValue(null as never);

    await createBodyWeightEntryAction(initialBodyWeightActionState, makeFormData());

    expect(redirect).toHaveBeenCalledWith("/auth/login");
  });

  it("returns field errors when payload is invalid", async () => {
    vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);

    const result = await createBodyWeightEntryAction(
      initialBodyWeightActionState,
      makeFormData({ weight: "-5", date: "bad-date" })
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors.weight).toBeDefined();
    expect(result.fieldErrors.date).toBeDefined();
    expect(createBodyWeightEntry).not.toHaveBeenCalled();
  });

  it("returns success with saved entry", async () => {
    vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
    vi.mocked(createBodyWeightEntry).mockResolvedValue({
      id: "entry-1",
      weight: 185.2,
      date: "2026-02-25",
      createdAt: "2026-02-25T10:00:00.000Z",
    });

    const result = await createBodyWeightEntryAction(initialBodyWeightActionState, makeFormData());

    expect(result.status).toBe("success");
    expect(result.savedEntry?.id).toBe("entry-1");
    expect(createBodyWeightEntry).toHaveBeenCalledWith(
      { weight: 185.2, date: "2026-02-25" },
      "auth0|123"
    );
  });

  it("returns api error state when save fails", async () => {
    vi.mocked(auth0.getSession).mockResolvedValue(mockSession as never);
    vi.mocked(createBodyWeightEntry).mockRejectedValue(new ApiError(500, "Server down"));

    const result = await createBodyWeightEntryAction(initialBodyWeightActionState, makeFormData());

    expect(result.status).toBe("error");
    expect(result.message).toContain("Server down");
  });
});
