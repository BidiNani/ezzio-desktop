// Client HTTP bas niveau pour l'API E-ZZIO.
// Extrait de useEzzioApi.ts (refactor 2026-09-19).

export const DEFAULT_PORT = 8001;
export const PING_INTERVAL_MS = 30000;

export interface ServerConfig {
  address: string;
  port: number;
}

export function buildBaseUrl(config: ServerConfig): string {
  const host = config.address || '127.0.0.1';
  return `http://${host}:${config.port}`;
}

/**
 * Lit la cle API depuis localStorage (peut etre absent en environnement test).
 */
function readApiKey(): string {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('ezzio_api_key') ?? '';
    }
  } catch {
    // ignore : environnement sans localStorage
  }
  return '';
}

/**
 * Requete JSON bas niveau. Ajoute X-API-Key et Content-Type par defaut,
 * fusionne avec les headers fournis dans options.
 */
export async function request<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': readApiKey(),
        ...(options.headers as Record<string, string> | undefined),
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function ping(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { 'X-API-Key': readApiKey() },
    });
    return res.ok;
  } catch {
    return false;
  }
}