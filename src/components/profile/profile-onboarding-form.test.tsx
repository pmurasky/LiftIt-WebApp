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
import { createProfileAction } from "@/lib/profile/actions";

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
            expect(screen.getByLabelText(/Units Preference \*/i)).toBeDefined();
            expect(screen.getByLabelText(/Display Name/i)).toBeDefined();
            expect(screen.getByLabelText(/Gender/i)).toBeDefined();
            expect(screen.getByLabelText(/Birthdate/i)).toBeDefined();
            expect(screen.getByLabelText(/Height \(cm\)/i)).toBeDefined();
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

    describe("unit toggling logic", () => {
        it("changes height placeholder and label based on unit preference", () => {
            render(<ProfileOnboardingForm />);

            const unitsSelect = screen.getByLabelText(/Units Preference \*/i) as HTMLSelectElement;

            // Default metric
            expect(screen.getByLabelText(/Height \(cm\)/i)).toBeDefined();
            expect(screen.getByPlaceholderText("178")).toBeDefined();

            // Change to imperial
            fireEvent.change(unitsSelect, { target: { value: "imperial" } });

            expect(screen.getByLabelText(/Height \(in\)/i)).toBeDefined();
            expect(screen.getByPlaceholderText("70")).toBeDefined();
        });

        it("converts height correctly when switching from metric to imperial", () => {
            render(<ProfileOnboardingForm />);

            const heightInput = screen.getByLabelText(/Height \(cm\)/i) as HTMLInputElement;
            const unitsSelect = screen.getByLabelText(/Units Preference \*/i) as HTMLSelectElement;

            // Enter metric value
            fireEvent.change(heightInput, { target: { value: "180" } });

            // Switch to imperial
            fireEvent.change(unitsSelect, { target: { value: "imperial" } });

            // 180cm -> ~70.9in
            expect((screen.getByLabelText(/Height \(in\)/i) as HTMLInputElement).value).toBe("70.9");

            // Hidden heightCm should be the rounded converted value
            const hiddenInput = document.querySelector('input[name="heightCm"]') as HTMLInputElement;
            expect(hiddenInput.value).toBe("180.09");
        });

        it("converts height correctly when switching from imperial to metric", () => {
            render(<ProfileOnboardingForm />);

            const unitsSelect = screen.getByLabelText(/Units Preference \*/i) as HTMLSelectElement;

            // Switch to imperial first
            fireEvent.change(unitsSelect, { target: { value: "imperial" } });

            const heightInput = screen.getByLabelText(/Height \(in\)/i) as HTMLInputElement;

            // Enter imperial value
            fireEvent.change(heightInput, { target: { value: "70" } });

            // Switch back to metric
            fireEvent.change(unitsSelect, { target: { value: "metric" } });

            // 70in -> ~177.8cm
            expect((screen.getByLabelText(/Height \(cm\)/i) as HTMLInputElement).value).toBe("177.8");

            // Hidden heightCm should be updated
            const hiddenInput = document.querySelector('input[name="heightCm"]') as HTMLInputElement;
            expect(hiddenInput.value).toBe("177.8");
        });

        it("handles switching units with empty height input", () => {
            render(<ProfileOnboardingForm />);

            const unitsSelect = screen.getByLabelText(/Units Preference \*/i) as HTMLSelectElement;
            const heightInput = screen.getByLabelText(/Height \(cm\)/i) as HTMLInputElement;

            expect(heightInput.value).toBe("");

            // Switch to imperial
            fireEvent.change(unitsSelect, { target: { value: "imperial" } });

            // Should still be empty
            expect((screen.getByLabelText(/Height \(in\)/i) as HTMLInputElement).value).toBe("");
        });

        it("handles switching to the same unit", () => {
            render(<ProfileOnboardingForm />);

            const unitsSelect = screen.getByLabelText(/Units Preference \*/i) as HTMLSelectElement;
            const heightInput = screen.getByLabelText(/Height \(cm\)/i) as HTMLInputElement;

            fireEvent.change(heightInput, { target: { value: "180" } });

            // Try to switch to metric (already metric)
            fireEvent.change(unitsSelect, { target: { value: "metric" } });

            // Should still be unchanged
            expect(heightInput.value).toBe("180");
        });
    });

    describe("form submission", () => {
        it("passes formAction to the form element", () => {
            // Because we mock useActionState and pass mockFormAction,
            // the <form action={..}> attribute receives that mock function.
            render(<ProfileOnboardingForm />);

            // We can't directly check the action prop easily, but we know it's wired
            // if it calls mockFormAction when we submit it via Testing Library
            const form = document.querySelector("form");
            expect(form).toBeDefined();

            // Fire submit event
            if (form) {
                fireEvent.submit(form);
            }
            expect(mockFormAction).toHaveBeenCalled();
        });
    });
});
