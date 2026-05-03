import { test, expect } from '@playwright/test';

test.describe('Full OBE Cycle Capstone Demo', () => {
  test('Program Setup, Assessment, and CQI Flow', async ({ page }) => {
    // 1. Program Head Flow
    await page.goto('/login');
    await page.fill('input[name="email"]', 'ph@aces.edu.ph');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);

    await page.click('text=Programs');
    await page.click('text=BS Information Technology');
    // Assuming UI has a 'Generate Snapshot' button
    await page.click('text=Generate Curriculum Snapshot');
    await expect(page.locator('text=Snapshot created successfully')).toBeVisible();
    await page.click('text=Logout');

    // 2. Faculty Flow
    await page.goto('/login');
    await page.fill('input[name="email"]', 'faculty@aces.edu.ph');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    await page.click('text=My Assignments');
    await page.click('text=IT101');
    await page.click('text=Assessments');
    await page.click('text=Input Scores');
    
    // Simulate grading
    await page.fill('input[name="score_0"]', '85');
    await page.click('button:has-text("Save Scores")');
    await expect(page.locator('text=Scores updated')).toBeVisible();
    await page.click('text=Logout');

    // 3. Admin / Computation Flow
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@aces.edu.ph');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    await page.click('text=Compute Attainment');
    await expect(page.locator('text=Computation queued')).toBeVisible();
  });
});
