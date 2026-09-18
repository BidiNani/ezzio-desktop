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

export async function request<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function ping(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}