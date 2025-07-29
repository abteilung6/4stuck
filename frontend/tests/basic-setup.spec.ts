import { test, expect } from '@playwright/test';

test.describe('Basic Setup Verification', () => {
  test('should load the app and show at least one button', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Vite \+ React/);
    // Check that at least one button is present and visible
    const buttonCount = await page.locator('button').count();
    expect(buttonCount).toBeGreaterThan(0);
    await expect(page.locator('button').first()).toBeVisible();
  });

  test('should be responsive and show UI on different viewports', async ({ page }) => {
    await page.goto('/');
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('button').first()).toBeVisible();
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('button').first()).toBeVisible();
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('button').first()).toBeVisible();
  });
});
