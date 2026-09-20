import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildBaseUrl, DEFAULT_PORT, readApiKey, request, ping } from './client';

describe('client API - configuration et requetes', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('DEFAULT_PORT est 8001', () => {
    expect(DEFAULT_PORT).toBe(8001);
  });

  it('buildBaseUrl respecte la configuration passee en argument', () => {
    const url = buildBaseUrl({ address: '192.168.1.10', port: 9000 });
    expect(url).toBe('http://192.168.1.10:9000');
  });

  it('buildBaseUrl utilise 127.0.0.1 si address vide', () => {
    const url = buildBaseUrl({ address: '', port: 8001 });
    expect(url).toBe('http://127.0.0.1:8001');
  });

  it('buildBaseUrl utilise DEFAULT_PORT si port = 0', () => {
    const url = buildBaseUrl({ address: 'localhost', port: 0 });
    expect(url).toBe('http://localhost:8001');
  });

  it('readApiKey lit la cle dans localStorage si pas de VITE_API_KEY', () => {
    localStorage.setItem('ezzio_api_key', 'test-secret-token');
    expect(readApiKey()).toBe('test-secret-token');
  });

  it('readApiKey retourne chaine vide si rien', () => {
    expect(readApiKey()).toBe('');
  });

  it('request injecte Content-Type et X-API-Key', async () => {
    localStorage.setItem('ezzio_api_key', 'my-api-key');

    let capturedHeaders: Record<string, string> | undefined;
    globalThis.fetch = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      capturedHeaders = init?.headers as Record<string, string> | undefined;
      return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    });

    const res = await request('http://127.0.0.1:8001', '/status');
    expect(res).toEqual({ ok: true });
    expect(capturedHeaders).toBeDefined();
    expect(capturedHeaders!['X-API-Key']).toBe('my-api-key');
    expect(capturedHeaders!['Content-Type']).toBe('application/json');
  });

  it('request retourne null si HTTP non-ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
    const res = await request('http://127.0.0.1:8001', '/status');
    expect(res).toBeNull();
  });

  it('request retourne null si fetch rejette', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('offline'));
    const res = await request('http://127.0.0.1:8001', '/status');
    expect(res).toBeNull();
  });

  it('ping retourne true sur HTTP 200', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    expect(await ping('http://127.0.0.1:8001')).toBe(true);
  });

  it('ping retourne false sur HTTP 500', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
    expect(await ping('http://127.0.0.1:8001')).toBe(false);
  });

  it('ping retourne false si fetch rejette', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('offline'));
    expect(await ping('http://127.0.0.1:8001')).toBe(false);
  });
});
