/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileOnboardingForm } from "./profile-onboarding-form";

// Mock React core hooks
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: vi.fn(),
  };
});

import { useActionState } from "react";
import { initialCreateProfileActionState } from "@/lib/profile/action-state";

// Mock the action
vi.mock("@/lib/profile/actions", () => ({
    createProfileAction: vi.fn(),
}));

describe("ProfileOnboardingForm", () => {
  const mockUseActionState = useActionState as Mock;
  const mockFormAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseActionState.mockReturnValue([
      initialCreateProfileActionState,
      mockFormAction,
      false, // isPending
    ]);
  });

  afterEach(() => {
    cleanup();
  });

  describe("rendering", () => {
    it("renders all core fields", () => {
      render(<ProfileOnboardingForm />);

      expect(screen.getByLabelText(/Username \*/i)).toBeDefined();
      expect(screen.getByText("Units Preference *")).toBeDefined();
      expect(screen.getByText("Imperial (lb, ft/in)")).toBeDefined();
      expect(screen.getByLabelText(/Display Name/i)).toBeDefined();
      expect(screen.getByLabelText(/Gender/i)).toBeDefined();
      expect(screen.getByLabelText(/Birthdate/i)).toBeDefined();
      expect(screen.getByLabelText(/Feet/i)).toBeDefined();
      expect(screen.getByLabelText(/Inches/i)).toBeDefined();
      expect(screen.getByRole("button", { name: "Create Profile" })).toBeDefined();
    });

    it("displays validation errors from state", () => {
      mockUseActionState.mockReturnValue([
        {
          ...initialCreateProfileActionState,
          status: "error",
          fieldErrors: {
            username: "Username is required",
            unitsPreference: "Invalid units",
            displayName: "Name too long",
            gender: "Invalid gender",
            birthdate: "Invalid date",
            heightCm: "Height required",
          },
        },
        mockFormAction,
        false,
      ]);

      render(<ProfileOnboardingForm />);

      expect(screen.getByText("Username is required")).toBeDefined();
      expect(screen.getByText("Invalid units")).toBeDefined();
      expect(screen.getByText("Name too long")).toBeDefined();
      expect(screen.getByText("Invalid gender")).toBeDefined();
      expect(screen.getByText("Invalid date")).toBeDefined();
      expect(screen.getByText("Height required")).toBeDefined();
    });

    it("displays global server errors", () => {
      mockUseActionState.mockReturnValue([
        {
          ...initialCreateProfileActionState,
          status: "error",
          message: "Database connection failed",
        },
        mockFormAction,
        false,
      ]);

      render(<ProfileOnboardingForm />);
      expect(screen.getByText("Database connection failed")).toBeDefined();
    });

    it("shows pending state during submission", () => {
      mockUseActionState.mockReturnValue([
        initialCreateProfileActionState,
        mockFormAction,
        true, // isPending
      ]);

      render(<ProfileOnboardingForm />);
      const button = screen.getByRole("button", { name: "Creating profile..." }) as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });
  });

  describe("imperial-only behavior", () => {
    it("submits a hidden imperial units preference", () => {
      render(<ProfileOnboardingForm />);

      const hiddenUnits = document.querySelector('input[name="unitsPreference"]') as HTMLInputElement;
      expect(hiddenUnits.value).toBe("imperial");
    });

    it("converts entered feet and inches to cm for the API payload", () => {
      render(<ProfileOnboardingForm />);

      const feetInput = screen.getByLabelText(/Feet/i) as HTMLInputElement;
      const inchesInput = screen.getByLabelText(/Inches/i) as HTMLInputElement;
      fireEvent.change(feetInput, { target: { value: "5" } });
      fireEvent.change(inchesInput, { target: { value: "10" } });

      const hiddenHeight = document.querySelector('input[name="heightCm"]') as HTMLInputElement;
      expect(hiddenHeight.value).toBe("177.8");
    });

    it("keeps hidden height empty when feet input is invalid", () => {
      render(<ProfileOnboardingForm />);

      const feetInput = screen.getByLabelText(/Feet/i) as HTMLInputElement;
      fireEvent.change(feetInput, { target: { value: "not-a-number" } });

      const hiddenHeight = document.querySelector('input[name="heightCm"]') as HTMLInputElement;
      expect(hiddenHeight.value).toBe("");
    });
  });

  describe("form submission", () => {
    it("passes formAction to the form element", () => {
      render(<ProfileOnboardingForm />);

      const form = document.querySelector("form");
      expect(form).toBeDefined();

      if (form) {
        fireEvent.submit(form);
      }

      expect(mockFormAction).toHaveBeenCalled();
    });
  });
});
