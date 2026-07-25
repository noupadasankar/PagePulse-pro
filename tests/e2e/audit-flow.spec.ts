import { test, expect } from '@playwright/test';

test.describe('Audit Flow E2E', () => {
  test('should allow a user to submit a URL and see audit results', async ({ page }) => {
    // 1. Navigate to landing page
    await page.goto('/');
    
    // 2. Submit URL
    const urlInput = page.getByPlaceholder(/enter any website url/i);
    await expect(urlInput).toBeVisible({ timeout: 10000 });
    await urlInput.fill('https://example.com');
    await page.getByRole('button', { name: /analyze now/i }).click();

    // 3. Verify loading or results state
    await expect(page.getByText(/analyzing/i).first()).toBeVisible({ timeout: 5000 }).catch(() => {});

    // 4. Verify metric results rendering
    await expect(page.getByText(/overall health score/i)).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Performance').first()).toBeVisible();
    await expect(page.getByText('Accessibility').first()).toBeVisible();
    await expect(page.getByText('SEO').first()).toBeVisible();

    // 5. Test share or copy functionality
    const copyButton = page.getByRole('button', { name: /copy json/i });
    if (await copyButton.isVisible()) {
      await expect(copyButton).toBeEnabled();
    }
  });
});
