// tests/e2e/report-generation.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Report Generation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('#input-email',    'program_head@panabo.aces.edu.ph')
    await page.fill('#input-password', 'ProgramHead@1234!')
    await page.click('#btn-login')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('program head can navigate to Reports', async ({ page }) => {
    await page.click('a[href="/dashboard/reports"]')
    await expect(page.locator('h1')).toContainText('Reports')
  })

  test('can open request report modal', async ({ page }) => {
    await page.goto('/dashboard/reports')
    await page.click('#btn-request-report')
    await expect(page.locator('text=Request Report')).toBeVisible()
    await expect(page.locator('#input-report-program')).toBeVisible()
    await expect(page.locator('#input-report-type')).toBeVisible()
  })

  test('report appears in list after requesting', async ({ page }) => {
    await page.goto('/dashboard/reports')
    await page.click('#btn-request-report')
    // Select first available program and period
    const programSelect = page.locator('#input-report-program')
    await programSelect.selectOption({ index: 1 })
    const periodSelect  = page.locator('#input-report-period')
    await periodSelect.selectOption({ index: 1 })
    await page.click('#btn-submit-report')
    // Report should appear with pending status
    await expect(page.locator('text=pending')).toBeVisible({ timeout: 5000 })
  })
})
