import { test, expect } from '@playwright/test';

test.describe('Stabilité du polling', () => {
  test('1 onglet : ~3 requêtes max en 10s (anti-spam)', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', req => {
      if (req.url().includes('/master/')) requests.push(req.url());
    });

    await page.goto('/');
    await page.waitForTimeout(10_000);

    // 1 onglet doit faire ~2-3 requêtes /master/* en 10s (intervals 30-60s)
    // Tolérance ×2 pour l'init (tick immédiat au mount)
    expect(requests.length).toBeLessThanOrEqual(6);
  });

  test('UI reste en ligne (attente 15s)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=En ligne')).toBeVisible({ timeout: 15_000 });
  });

  test('3 onglets : moyenne < 15 req/onglet en 8s', async ({ context }) => {
    const pages = await Promise.all([
      context.newPage(),
      context.newPage(),
      context.newPage(),
    ]);

    let requestCount = 0;
    pages.forEach(p => {
      p.on('request', req => {
        if (req.url().includes('/master/')) requestCount++;
      });
    });

    // Ouvrir les 3 onglets simultanément
    await Promise.all(pages.map(p => p.goto('/')));

    // Attendre que ça se stabilise
    await pages[0].waitForTimeout(8_000);

    // Le vrai test anti-spam : la MOYENNE par onglet
    // (3 onglets × ~4-6 req en 8s = ~12-18 total)
    const avgPerPage = requestCount / 3;
    console.log(`[e2e] Total: ${requestCount} req, moyenne ${avgPerPage.toFixed(1)}/onglet`);
    expect(avgPerPage).toBeLessThan(15);
  });
});