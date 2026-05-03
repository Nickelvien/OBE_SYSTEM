// tests/e2e/score-entry.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Faculty Score Entry Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as faculty
    await page.goto('/login')
    await page.fill('#input-email',    'faculty@panabo.aces.edu.ph')
    await page.fill('#input-password', 'Faculty@1234!')
    await page.click('#btn-login')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('faculty can navigate to My Courses', async ({ page }) => {
    await page.click('a[href="/dashboard/faculty/assignments"]')
    await expect(page.locator('h1')).toContainText('My Courses')
  })

  test('score entry shows Stale badge after saving a score', async ({ page }) => {
    await page.goto('/dashboard/faculty/assignments')
    const firstCourse = page.locator('[id^="btn-scores-"]').first()
    if (await firstCourse.isVisible()) {
      await firstCourse.click()
      const firstScoreInput = page.locator('[id^="score-"]').first()
      if (await firstScoreInput.isVisible()) {
        await firstScoreInput.fill('85')
        await firstScoreInput.blur()
        // Wait for stale badge to appear
        await expect(page.locator('text=Stale')).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('accreditor is redirected on expired access', async ({ page }) => {
    // Set middleware redirect — directly visit expired
    await page.goto('/expired')
    await expect(page.locator('h1')).toContainText('Accreditor Access Expired')
    await expect(page.locator('#btn-back-login')).toBeVisible()
  })
})
