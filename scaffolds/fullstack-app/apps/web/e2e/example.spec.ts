import { expect, test } from '@playwright/test';

test('has title and landing page content', async ({ page }) => {
  await page.goto('/');

  // Expect title to contain "Home" (the meta title configured in metadata)
  await expect(page).toHaveTitle(/Home/);

  // Expect the main headline to be visible and contain the core text
  const headline = page.locator('h1');
  await expect(headline).toBeVisible();
  await expect(headline).toContainText(/keeps agents aligned/i);
});

test('navigation to explore features works', async ({ page }) => {
  await page.goto('/');

  // Find the explore features CTA button/link
  const exploreFeaturesLink = page.getByRole('link', { name: /explore features/i });
  await expect(exploreFeaturesLink).toBeVisible();

  // Click the link and expect routing to /features
  await exploreFeaturesLink.click();
  await expect(page).toHaveURL(/\/features/);

  // Expect the features header to be visible on the new page
  const header = page.locator('h1');
  await expect(header).toBeVisible();
  await expect(header).toContainText(/features/i);
});
