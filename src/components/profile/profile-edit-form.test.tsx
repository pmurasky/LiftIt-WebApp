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
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
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

            // Username is read-only p tag
            expect(screen.getByText("testuser")).toBeDefined();

            expect(screen.getByLabelText(/Units Preference \*/i)).toBeDefined();
            expect(screen.getByLabelText(/Display Name/i)).toBeDefined();
            expect(screen.getByLabelText(/Gender/i)).toBeDefined();
            expect(screen.getByLabelText(/Birthdate/i)).toBeDefined();
            expect(screen.getByLabelText(/Height \(cm\)/i)).toBeDefined();
            expect(screen.getByRole("button", { name: "Save Changes" })).toBeDefined();
        });

        it("pre-populates fields based on full profile", () => {
            render(<ProfileEditForm profile={mockProfile} />);

            const unitsSelect = screen.getByLabelText(/Units Preference \*/i) as HTMLSelectElement;
            expect(unitsSelect.value).toBe("metric");

            const displayNameInput = screen.getByLabelText(/Display Name/i) as HTMLInputElement;
            expect(displayNameInput.value).toBe("Test User");

            const genderSelect = screen.getByLabelText(/Gender/i) as HTMLSelectElement;
            expect(genderSelect.value).toBe("male");

            const birthdateInput = screen.getByLabelText(/Birthdate/i) as HTMLInputElement;
            expect(birthdateInput.value).toBe("1990-01-01");

            const heightInput = screen.getByLabelText(/Height \(cm\)/i) as HTMLInputElement;
            expect(heightInput.value).toBe("180");
        });

        it("pre-populates fields properly with metric and missing optional fields", () => {
            const basicProfile: UserProfile = {
                username: "basicuser",
                heightCm: 175,
                unitsPreference: "metric",
                createdAt: "Now",
                updatedAt: "Now"
            };

            render(<ProfileEditForm profile={basicProfile} />);

            const unitsSelect = screen.getByLabelText(/Units Preference \*/i) as HTMLSelectElement;
            expect(unitsSelect.value).toBe("metric");

            const heightInput = screen.getByLabelText(/Height \(cm\)/i) as HTMLInputElement;
            expect(heightInput.value).toBe("175");

            const displayNameInput = screen.getByLabelText(/Display Name/i) as HTMLInputElement;
            expect(displayNameInput.value).toBe("");

            const genderSelect = screen.getByLabelText(/Gender/i) as HTMLSelectElement;
            expect(genderSelect.value).toBe("");
        });

        it("pre-populates height fields properly with imperial units flag", () => {
            const imperialProfile: UserProfile = {
                ...mockProfile,
                unitsPreference: "imperial",
            };
            // 180cm -> 70.86in -> rounded to 70.9
            render(<ProfileEditForm profile={imperialProfile} />);

            const unitsSelect = screen.getByLabelText(/Units Preference \*/i) as HTMLSelectElement;
            expect(unitsSelect.value).toBe("imperial");

            const heightInput = screen.getByLabelText(/Height \(in\)/i) as HTMLInputElement;
            expect(heightInput.value).toBe("70.9");

            // hidden height field
            const hiddenInput = document.querySelector('input[name="heightCm"]') as HTMLInputElement;
            expect(hiddenInput.value).toBe("180.09");
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

    describe("unit toggling logic", () => {
        it("converts height correctly when switching from metric to imperial", () => {
            render(<ProfileEditForm profile={mockProfile} />);

            const heightInput = screen.getByLabelText(/Height \(cm\)/i) as HTMLInputElement;
            const unitsSelect = screen.getByLabelText(/Units Preference \*/i) as HTMLSelectElement;

            // Enter metric value
            fireEvent.change(heightInput, { target: { value: "190" } });

            // Switch to imperial
            fireEvent.change(unitsSelect, { target: { value: "imperial" } });

            // 190cm -> ~74.8in
            expect((screen.getByLabelText(/Height \(in\)/i) as HTMLInputElement).value).toBe("74.8");

            // Hidden heightCm should be the rounded converted value (74.8 in = 189.992)
            const hiddenInput = document.querySelector('input[name="heightCm"]') as HTMLInputElement;
            expect(hiddenInput.value).toBe("189.99");
        });

        it("converts height correctly when switching from imperial to metric", () => {
            render(<ProfileEditForm profile={{ ...mockProfile, unitsPreference: "imperial" }} />);

            const unitsSelect = screen.getByLabelText(/Units Preference \*/i) as HTMLSelectElement;
            const heightInput = screen.getByLabelText(/Height \(in\)/i) as HTMLInputElement;

            // Enter imperial value
            fireEvent.change(heightInput, { target: { value: "72" } }); // exactly 6 feet

            // Switch to metric
            fireEvent.change(unitsSelect, { target: { value: "metric" } });

            // 72in -> ~182.9cm
            expect((screen.getByLabelText(/Height \(cm\)/i) as HTMLInputElement).value).toBe("182.9");

            // Hidden heightCm should be updated
            const hiddenInput = document.querySelector('input[name="heightCm"]') as HTMLInputElement;
            expect(hiddenInput.value).toBe("182.9");
        });

        it("handles switching units with empty height input", () => {
            render(<ProfileEditForm profile={mockProfile} />);

            const unitsSelect = screen.getByLabelText(/Units Preference \*/i) as HTMLSelectElement;
            const heightInput = screen.getByLabelText(/Height \(cm\)/i) as HTMLInputElement;

            fireEvent.change(heightInput, { target: { value: "" } });

            // Switch to imperial
            fireEvent.change(unitsSelect, { target: { value: "imperial" } });

            // Should still be empty
            expect((screen.getByLabelText(/Height \(in\)/i) as HTMLInputElement).value).toBe("");
        });

        it("handles switching to the same unit", () => {
            render(<ProfileEditForm profile={mockProfile} />);

            const unitsSelect = screen.getByLabelText(/Units Preference \*/i) as HTMLSelectElement;
            const heightInput = screen.getByLabelText(/Height \(cm\)/i) as HTMLInputElement;

            // Try to switch to metric (already metric)
            fireEvent.change(unitsSelect, { target: { value: "metric" } });

            // Should still be unchanged
            expect(heightInput.value).toBe("180");
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
