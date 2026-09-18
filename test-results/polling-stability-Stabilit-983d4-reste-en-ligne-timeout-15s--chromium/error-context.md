# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: polling-stability.spec.ts >> Stabilité du polling >> UI reste en ligne (timeout 15s)
- Location: e2e\polling-stability.spec.ts:16:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=En ligne')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('text=En ligne') with timeout 15000ms
  - waiting for locator('text=En ligne')

```

```yaml
- navigation:
  - text: E-ZZIO Workspace v9.4
  - button "Chat"
  - button "Missions"
  - button "Approbations"
  - button "Objectifs"
  - button "Projets"
  - button "Fichiers"
  - button "Recherche"
  - button "Automatisations"
  - button "Mémoire"
  - button "Comptes"
  - button "Santé"
  - button "Réglages"
  - button "Kill switch"
- banner:
  - text: E-ZZIO
  - img
  - textbox "Recherche dans l'espace..."
  - text: auto · auto · LIVE
  - button "Changer de thème":
    - img
  - button "Afficher le panneau de contexte":
    - img
- text: Conversation 1 message
- button "◆ Gemini 3.5 Flash-Lite ▼"
- text: E-ZZIO 22:11 Système E-ZZIO Workspace initialisé. En attente d'instruction.
- textbox "Écrire un message… (Entrée pour envoyer, Maj+Entrée pour saut de ligne)"
- button "↑" [disabled]
- text: Routage souverain E-ZZIO (ModelRouter autoritaire)
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Stabilité du polling', () => {
  4  |   test('1 onglet : 3 requêtes max en 10s', async ({ page }) => {
  5  |     const requests: string[] = [];
  6  |     page.on('request', req => {
  7  |       if (req.url().includes('/master/')) requests.push(req.url());
  8  |     });
  9  | 
  10 |     await page.goto('/');
  11 |     await page.waitForTimeout(10_000);
  12 | 
  13 |     expect(requests.length).toBeLessThan(6);
  14 |   });
  15 | 
  16 |   test('UI reste en ligne (timeout 15s)', async ({ page }) => {
  17 |     await page.goto('/');
  18 | 
> 19 |     await expect(page.locator('text=En ligne')).toBeVisible({ timeout: 15_000 });
     |                                                 ^ Error: expect(locator).toBeVisible() failed
  20 |   });
  21 | 
  22 |   test('3 onglets : charge raisonnable', async ({ context }) => {
  23 |     const pages = await Promise.all([
  24 |       context.newPage(),
  25 |       context.newPage(),
  26 |       context.newPage(),
  27 |     ]);
  28 | 
  29 |     let requestCount = 0;
  30 |     pages.forEach(p => {
  31 |       p.on('request', req => {
  32 |         if (req.url().includes('/master/')) requestCount++;
  33 |       });
  34 |     });
  35 | 
  36 |     await Promise.all(pages.map(p => p.goto('/')));
  37 |     await pages[0].waitForTimeout(5_000);
  38 | 
  39 |     expect(requestCount).toBeLessThan(20);
  40 |   });
  41 | });
```