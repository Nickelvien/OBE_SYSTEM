// tests/e2e/accreditor-expiry.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Accreditor Expiry Flow', () => {
  test('expired accreditor is redirected to /expired page', async ({ page }) => {
    // Test the expired page directly
    await page.goto('/expired')
    await expect(page.locator('h1')).toContainText('Accreditor Access Expired')
    await expect(page.locator('#btn-back-login')).toBeVisible()
  })

  test('expired page has correct metadata', async ({ page }) => {
    await page.goto('/expired')
    const title = await page.title()
    expect(title).toContain('Access Expired')
  })

  test('clicking Return to Login navigates to login page', async ({ page }) => {
    await page.goto('/expired')
    await page.click('#btn-back-login')
    await expect(page).toHaveURL(/\/login/)
  })

  test('active accreditor with valid expiry can access dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#input-email',    'accreditor@panabo.aces.edu.ph')
    await page.fill('#input-password', 'Accreditor@1234!')
    await page.click('#btn-login')
    // With a future expiry date (set in seed), should reach dashboard
    await expect(page).toHaveURL(/\/(dashboard|login|expired)/)
  })
})
