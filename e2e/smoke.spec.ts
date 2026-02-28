import { expect, test } from "@playwright/test";

test("onboarding profile page renders", async ({ page }) => {
  await page.goto("/onboarding/profile");

  await expect(page.getByRole("heading", { name: "Create your profile" })).toBeVisible();
  await expect(page.getByText("Step 1 of 1")).toBeVisible();
});
