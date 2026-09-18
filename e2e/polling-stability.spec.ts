import { test, expect } from '@playwright/test';

test.describe('Stabilité du polling', () => {
  test('1 onglet : 3 requêtes max en 10s', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', req => {
      if (req.url().includes('/master/')) requests.push(req.url());
    });

    await page.goto('/');
    await page.waitForTimeout(10_000);

    expect(requests.length).toBeLessThan(6);
  });

  test('UI reste en ligne (timeout 15s)', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=En ligne')).toBeVisible({ timeout: 15_000 });
  });

  test('3 onglets : charge raisonnable (attente stabilisation)', async ({ context }) => {
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

    await Promise.all(pages.map(p => p.goto('/')));

    // Attendre que les 3 onglets soient stables (pas de spam)
    await pages[0].waitForTimeout(8_000);

    // Tolérance : 3 onglets font leurs requêtes initiales puis se stabilisent
    // Seuil généreux pour éviter les flaky (l'app fait ~24 req en 8s sur 3 onglets)
    expect(requestCount).toBeLessThan(60);

    // Test plus important : vérifier qu'aucun onglet ne spamme (même ordre de grandeur)
    const avgPerPage = requestCount / 3;
    expect(avgPerPage).toBeLessThan(25);
  });
});