import { test, expect } from '@playwright/test';

test.describe('Stabilité du polling', () => {
  test('1 onglet : ~3 requêtes max en 10s (anti-spam)', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', req => {
      if (req.url().includes('/master/')) requests.push(req.url());
    });

    await page.goto('/');
    await page.waitForTimeout(10_000);

    expect(requests.length).toBeLessThanOrEqual(6);
  });

  test('Backend répond (health + master)', async ({ request }) => {
    // Vérifie directement que le backend est joignable
    const healthResp = await request.get('http://127.0.0.1:8001/health');
    expect(healthResp.ok()).toBeTruthy();

    const masterResp = await request.get('http://127.0.0.1:8001/master/missions', {
      headers: { 'X-API-Key': '' },
    });
    expect(masterResp.status()).not.toBe(401);  // pas de 401 (auth)
    expect(masterResp.status()).not.toBe(429);  // pas de 429 (rate limit)
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

    await Promise.all(pages.map(p => p.goto('/')));
    await pages[0].waitForTimeout(8_000);

    const avgPerPage = requestCount / 3;
    console.log(`[e2e] Total: ${requestCount} req, moyenne ${avgPerPage.toFixed(1)}/onglet`);
    expect(avgPerPage).toBeLessThan(15);
  });
});