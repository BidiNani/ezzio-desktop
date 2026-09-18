# E-ZZIO Desktop - Frontend

React + Vite + Tauri.

## Prérequis

- Node 20 LTS
- npm
- PowerShell 7+

## Setup

    cd G:\AI\ezzio-desktop
    npm install
    npm run test
    npm run typecheck
    npm run dev

## Scripts

- dev          : serveur de dev Vite
- build        : build production
- test         : vitest run (6 tests)
- test:e2e     : Playwright
- typecheck    : tsc --noEmit
- preview      : preview du build
- tauri        : CLI Tauri

Note : le script npm 'lint' n'est pas encore défini dans package.json.

## Structure

    src/
      api/           Client HTTP et types backend bas niveau
        types.ts       Interfaces Backend* (contrat brut)
        normalizers.ts Transformations backend -> types applicatifs
        client.ts      request, ping, buildBaseUrl, header X-API-Key
      hooks/         Hooks React (useEzzioApi, usePolling, etc.)
      components/    Composants UI
      test/          Tests vitest

## Tests

vitest avec **happy-dom** (compatible Node 20+, contrairement à jsdom
qui charge undici et crashe sur Node 20).

Les tests couvrent :

- useEzzioApi  : stabilité de référence entre 2 rendus (anti-boucle)
- usePolling   : tick initial, intervalle, unmount
- useBackendStatus : transition offline -> online

## Hooks Git

Dossier .githooks/ versionné, activé via core.hooksPath.

- pre-commit : lint + typecheck
- commit-msg : anti-doublon (20 derniers commits)

## CI

Fichier .github/workflows/ci.yml : lint + typecheck + test sur Node 20.

## Dette technique

- Tests E2E Web UI : à faire avec Playwright headless.
- useEzzioApi.ts (391 lignes) : pourrait migrer vers Zustand
  pour éviter les nombreux useCallback et le re-render cascade.

## Tailles actuelles

- src/hooks/useEzzioApi.ts : 391 lignes
- src/api/types.ts          : 60 lignes
- src/api/normalizers.ts    : 96 lignes
- src/api/client.ts         : 66 lignes