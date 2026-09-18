// Store Zustand — SQUELETTE (inactif tant que useEzzioApi.ts n'est pas migré).
//
// Objectif futur : remplacer les 20 useCallback du hook useEzzioApi par
// un store global, ce qui évitera les re-renders en cascade et simplifiera
// les composants consommateurs.
//
// ÉTAT ACTUEL : ce fichier n'est importé nulle part. Il documente la cible.
// Pour l'activer :
//   1. Implémenter chaque action (getMissions, sendChat, etc.) en copiant
//      la logique de useEzzioApi.ts.
//   2. Migrer les composants consommateurs du hook vers ce store.
//   3. Adapter src/test/useEzzioApi.test.ts (le test de stabilité ne
//      s'applique plus au store).
//   4. Supprimer useEzzioApi.ts une fois tous les consommateurs migrés.

import { create } from 'zustand';

// --- Types (miroir de useEzzioApi.ts) ---
interface ServerConfig {
  address: string;
  port: number;
  connected: boolean;
}

interface ApiState {
  serverConfig: ServerConfig;
  error: string | null;
  setServerAddress: (address: string) => void;
  setServerPort: (port: number) => void;
  // TODO: ajouter les 20+ méthodes (getMissions, sendChat, etc.)
}

// --- Store ---
export const useApiStore = create<ApiState>((set) => ({
  serverConfig: {
    address: '127.0.0.1',
    port: 8001,
    connected: false,
  },
  error: null,
  setServerAddress: (address) =>
    set((state) => ({ serverConfig: { ...state.serverConfig, address } })),
  setServerPort: (port) =>
    set((state) => ({ serverConfig: { ...state.serverConfig, port } })),
}));