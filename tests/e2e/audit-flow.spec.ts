import { test, expect } from '@playwright/test';

test.describe('Audit Flow E2E', () => {
  test('should allow a user to submit a URL and see audit results', async ({ page }) => {
    // 1. Navigate to landing page
    await page.goto('/');
    
    // 2. Submit URL
    const urlInput = page.getByPlaceholder(/enter a url/i);
    await urlInput.fill('https://example.com');
    await page.getByRole('button', { name: /audit page/i }).click();

    // 3. Verify loading state
    await expect(page.getByText(/running audit/i)).toBeVisible();

    // 4. Verify metric card rendering
    await expect(page.getByText('Performance')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Accessibility')).toBeVisible();
    await expect(page.getByText('SEO')).toBeVisible();

    // 5. Test share link functionality
    const shareButton = page.getByRole('button', { name: /share results/i });
    if (await shareButton.isVisible()) {
      await shareButton.click();
      await expect(page.getByText(/link copied/i)).toBeVisible();
    }
  });
});
