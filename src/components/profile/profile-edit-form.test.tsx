/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileEditForm } from "./profile-edit-form";
import type { UserProfile } from "@/lib/profile/api";

// Mock React core hooks
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: vi.fn(),
  };
});

import { useActionState } from "react";
import { initialUpdateProfileActionState } from "@/lib/profile/action-state";

// Mock the action
vi.mock("@/lib/profile/actions", () => ({
    updateProfileAction: vi.fn(),
}));

describe("ProfileEditForm", () => {
  const mockUseActionState = useActionState as Mock;
  const mockFormAction = vi.fn();

  const mockProfile: UserProfile = {
    username: "testuser",
    displayName: "Test User",
    gender: "male",
    birthdate: "1990-01-01",
    heightCm: 180,
    unitsPreference: "metric",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseActionState.mockReturnValue([
      initialUpdateProfileActionState,
      mockFormAction,
      false, // isPending
    ]);
  });

  afterEach(() => {
    cleanup();
  });

  describe("rendering", () => {
    it("renders all core fields", () => {
      render(<ProfileEditForm profile={mockProfile} />);

      expect(screen.getByText("testuser")).toBeDefined();
      expect(screen.getByText("Units Preference *")).toBeDefined();
      expect(screen.getByText("Imperial (in)")).toBeDefined();
      expect(screen.getByLabelText(/Display Name/i)).toBeDefined();
      expect(screen.getByLabelText(/Gender/i)).toBeDefined();
      expect(screen.getByLabelText(/Birthdate/i)).toBeDefined();
      expect(screen.getByLabelText(/Height \(in\)/i)).toBeDefined();
      expect(screen.getByRole("button", { name: "Save Changes" })).toBeDefined();
    });

    it("pre-populates fields based on full profile", () => {
      render(<ProfileEditForm profile={mockProfile} />);

      const displayNameInput = screen.getByLabelText(/Display Name/i) as HTMLInputElement;
      expect(displayNameInput.value).toBe("Test User");

      const genderSelect = screen.getByLabelText(/Gender/i) as HTMLSelectElement;
      expect(genderSelect.value).toBe("male");

      const birthdateInput = screen.getByLabelText(/Birthdate/i) as HTMLInputElement;
      expect(birthdateInput.value).toBe("1990-01-01");

      const heightInput = screen.getByLabelText(/Height \(in\)/i) as HTMLInputElement;
      expect(heightInput.value).toBe("70.9");
    });

    it("pre-populates with missing optional fields", () => {
      const basicProfile: UserProfile = {
        username: "basicuser",
        displayName: null,
        gender: null,
        birthdate: null,
        heightCm: 175,
        unitsPreference: "metric",
      };

      render(<ProfileEditForm profile={basicProfile} />);

      const heightInput = screen.getByLabelText(/Height \(in\)/i) as HTMLInputElement;
      expect(heightInput.value).toBe("68.9");

      const displayNameInput = screen.getByLabelText(/Display Name/i) as HTMLInputElement;
      expect(displayNameInput.value).toBe("");

      const genderSelect = screen.getByLabelText(/Gender/i) as HTMLSelectElement;
      expect(genderSelect.value).toBe("");
    });

    it("displays validation errors from state", () => {
      mockUseActionState.mockReturnValue([
        {
          ...initialUpdateProfileActionState,
          status: "error",
          fieldErrors: {
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

      render(<ProfileEditForm profile={mockProfile} />);

      expect(screen.getByText("Invalid units")).toBeDefined();
      expect(screen.getByText("Name too long")).toBeDefined();
      expect(screen.getByText("Invalid gender")).toBeDefined();
      expect(screen.getByText("Invalid date")).toBeDefined();
      expect(screen.getByText("Height required")).toBeDefined();
    });

    it("displays global server errors", () => {
      mockUseActionState.mockReturnValue([
        {
          ...initialUpdateProfileActionState,
          status: "error",
          message: "Database connection failed",
        },
        mockFormAction,
        false,
      ]);

      render(<ProfileEditForm profile={mockProfile} />);
      expect(screen.getByText("Database connection failed")).toBeDefined();
    });

    it("displays success messages", () => {
      mockUseActionState.mockReturnValue([
        {
          ...initialUpdateProfileActionState,
          status: "success",
          message: "Profile updated successfully.",
        },
        mockFormAction,
        false,
      ]);

      render(<ProfileEditForm profile={mockProfile} />);
      expect(screen.getByText("Profile updated successfully.")).toBeDefined();
    });

    it("shows pending state during submission", () => {
      mockUseActionState.mockReturnValue([
        initialUpdateProfileActionState,
        mockFormAction,
        true, // isPending
      ]);

      render(<ProfileEditForm profile={mockProfile} />);
      const button = screen.getByRole("button", { name: "Saving..." }) as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });
  });

  describe("imperial-only behavior", () => {
    it("submits a hidden imperial units preference", () => {
      render(<ProfileEditForm profile={mockProfile} />);

      const hiddenUnits = document.querySelector('input[name="unitsPreference"]') as HTMLInputElement;
      expect(hiddenUnits.value).toBe("imperial");
    });

    it("converts entered inches to cm for update payload", () => {
      render(<ProfileEditForm profile={mockProfile} />);

      const heightInput = screen.getByLabelText(/Height \(in\)/i) as HTMLInputElement;
      fireEvent.change(heightInput, { target: { value: "72" } });

      const hiddenHeight = document.querySelector('input[name="heightCm"]') as HTMLInputElement;
      expect(hiddenHeight.value).toBe("182.88");
    });

    it("keeps hidden height empty when input is blank", () => {
      render(<ProfileEditForm profile={mockProfile} />);

      const heightInput = screen.getByLabelText(/Height \(in\)/i) as HTMLInputElement;
      fireEvent.change(heightInput, { target: { value: "" } });

      const hiddenHeight = document.querySelector('input[name="heightCm"]') as HTMLInputElement;
      expect(hiddenHeight.value).toBe("");
    });
  });

  describe("form submission", () => {
    it("passes formAction to the form element", () => {
      render(<ProfileEditForm profile={mockProfile} />);

      const form = document.querySelector("form");
      expect(form).toBeDefined();

      if (form) {
        fireEvent.submit(form);
      }

      expect(mockFormAction).toHaveBeenCalled();
    });
  });
});
