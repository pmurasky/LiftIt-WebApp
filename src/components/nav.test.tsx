/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Nav } from "./nav";

// Mock the auth0 singleton
vi.mock("../lib/auth0", () => ({
  auth0: {
    getSession: vi.fn(),
  },
}));

// Mock the server actions
vi.mock("../lib/auth/actions", () => ({
  loginAction: vi.fn(),
  logoutAction: vi.fn(),
}));

import { auth0 } from "../lib/auth0";

describe("Nav", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should display Log in button when user is not authenticated", async () => {
    // Given
    vi.mocked(auth0.getSession).mockResolvedValue(null as never);

    // When
    const nav = await Nav();
    render(nav);

    // Then
    expect(screen.getByRole("button", { name: /log in/i })).toBeDefined();
    expect(screen.queryByRole("button", { name: /log out/i })).toBeNull();
  });

  it("should display user name and Log out button when user is authenticated", async () => {
    // Given
    vi.mocked(auth0.getSession).mockResolvedValue({
      user: {
        name: "John Doe",
        email: "john@example.com",
      },
    } as never);

    // When
    const nav = await Nav();
    render(nav);

    // Then
    expect(screen.getByText("John Doe")).toBeDefined();
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /log out/i })).toBeDefined();
    expect(screen.queryByRole("button", { name: /log in/i })).toBeNull();
  });

  it("should display user email when name is not available", async () => {
    // Given
    vi.mocked(auth0.getSession).mockResolvedValue({
      user: {
        email: "jane@example.com",
      },
    } as never);

    // When
    const nav = await Nav();
    render(nav);

    // Then
    expect(screen.getByText("jane@example.com")).toBeDefined();
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /log out/i })).toBeDefined();
  });

  it("should display LiftIt branding", async () => {
    // Given
    vi.mocked(auth0.getSession).mockResolvedValue(null as never);

    // When
    const nav = await Nav();
    render(nav);

    // Then
    expect(screen.getByText("LiftIt")).toBeDefined();
  });
});
