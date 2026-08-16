import { expect, test } from "@playwright/test";

test("Public tracker switches language and remembers the choice", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("rsu-bus-tour-seen", "true");
  });
  await page.route("https://*.tile.openstreetmap.org/**", (route) => route.abort());

  await page.goto("/");
  await expect(page.locator(".preloader-overlay")).toHaveCount(0);

  const thaiButton = page.getByRole("button", { name: "Thai" });
  const englishButton = page.getByRole("button", { name: "English" });
  await expect(thaiButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "ส่งข้อเสนอแนะ" })).toBeVisible();

  await englishButton.click();
  await expect(englishButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Send Feedback" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("rsu-tram-locale"))).toBe("en");

  await page.reload();
  await expect(page.locator(".preloader-overlay")).toHaveCount(0);
  await expect(englishButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Send Feedback" })).toBeVisible();

  await thaiButton.click();
  await expect(thaiButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "ส่งข้อเสนอแนะ" })).toBeVisible();
});
