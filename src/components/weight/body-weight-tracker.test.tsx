/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { BodyWeightTracker } from "@/components/weight/body-weight-tracker";
import { initialBodyWeightActionState } from "@/lib/weight/action-state";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: vi.fn(),
  };
});

import { useActionState } from "react";

vi.mock("@/lib/weight/actions", () => ({
  createBodyWeightEntryAction: vi.fn(),
}));

describe("BodyWeightTracker", () => {
  const mockUseActionState = useActionState as Mock;
  const mockFormAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseActionState.mockReturnValue([initialBodyWeightActionState, mockFormAction, false]);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders empty state when no entries exist", () => {
    render(<BodyWeightTracker initialEntries={[]} />);

    expect(screen.getByText(/No weight entries yet/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /save entry/i })).toBeDefined();
  });

  it("renders history rows from initial entries", () => {
    render(
      <BodyWeightTracker
        initialEntries={[
          {
            id: "entry-2",
            weight: 182.5,
            date: "2026-02-25",
            createdAt: "2026-02-25T08:00:00.000Z",
          },
          {
            id: "entry-1",
            weight: 184,
            date: "2026-02-24",
            createdAt: "2026-02-24T08:00:00.000Z",
          },
        ]}
      />
    );

    expect(screen.getByText("2026-02-25")).toBeDefined();
    expect(screen.getByText("182.50 lb")).toBeDefined();
    expect(screen.getByText("2026-02-24")).toBeDefined();
  });

  it("displays field-level errors and global errors", () => {
    mockUseActionState.mockReturnValue([
      {
        ...initialBodyWeightActionState,
        status: "error",
        message: "Save failed",
        fieldErrors: {
          weight: "Weight is required.",
          date: "Date is required.",
        },
      },
      mockFormAction,
      false,
    ]);

    render(<BodyWeightTracker initialEntries={[]} />);

    expect(screen.getByText("Weight is required.")).toBeDefined();
    expect(screen.getByText("Date is required.")).toBeDefined();
    expect(screen.getByText("Save failed")).toBeDefined();
  });

  it("shows pending submit state", () => {
    mockUseActionState.mockReturnValue([initialBodyWeightActionState, mockFormAction, true]);

    render(<BodyWeightTracker initialEntries={[]} />);

    const button = screen.getByRole("button", { name: "Saving..." }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("passes formAction to the form element", () => {
    render(<BodyWeightTracker initialEntries={[]} />);

    const form = document.querySelector("form");
    expect(form).toBeDefined();

    if (form) {
      fireEvent.submit(form);
    }

    expect(mockFormAction).toHaveBeenCalled();
  });
});
