import { test, expect } from '@playwright/test';

test('landing page basics', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Tap into the Digital Ecosystem/i })).toBeVisible();
  await expect(page.getByText(/Data\. Insights\. Reports\./i)).toBeVisible();
  await expect(page.getByPlaceholder(/Find Israeli Tech Companies/i)).toBeVisible();
  const tryBtn = page.getByRole('link', { name: /Try it Now/i });
  await expect(tryBtn).toHaveAttribute('href', '/companies');
  const advBtn = page.getByRole('link', { name: /Advanced Search/i });
  await expect(advBtn).toHaveAttribute('href', '/companies');
  await expect(page.getByRole('heading', { name: /Currently Available Profiles/i })).toBeVisible();
  const stats = ['Companies', 'Investment Firms', 'People', 'Funds'];
  for (const label of stats) {
    const id = label.toLowerCase().replace(/\s+/g, '-');
    const container = page.getByTestId(`stat-${id}`);
    await expect(container).toBeVisible();
    const number = await container.getByTestId('stat-number').innerText();
    expect(number).toMatch(/^\d+$/);
  }
});
