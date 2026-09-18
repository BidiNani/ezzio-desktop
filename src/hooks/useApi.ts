/**
 * useApi — client HTTP centralisé pour E-zzio.
 *
 * Fournit :
 *  - une base URL unique (variable d'env VITE_API_URL, fallback 127.0.0.1:8001)
 *  - un wrapper fetch avec timeout + abort
 *  - gestion d'erreur standardisée
 *  - hooks prêts à l'emploi : useGet, usePost
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export const API_BASE: string =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL ??
  'http://127.0.0.1:8001';

export interface ApiError {
  status: number;
  message: string;
  detail?: unknown;
}

export interface ApiResult<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  refresh: () => void;
}

async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  timeoutMs = 20000,
  externalSignal?: AbortSignal,
): Promise<T> {
  const ctl = new AbortController();
  const timer = window.setTimeout(() => ctl.abort(), timeoutMs);
  const signal = externalSignal
    ? AbortSignal.any([externalSignal, ctl.signal])
    : ctl.signal;

  try {
    const r = await fetch(`${API_BASE}${path}`, { ...init, signal });
    const text = await r.text();
    const json = text ? JSON.parse(text) : null;
    if (!r.ok) {
      throw {
        status: r.status,
        message: json?.detail?.message ?? json?.error ?? `HTTP ${r.status}`,
        detail: json,
      } as ApiError;
    }
    return json as T;
  } finally {
    window.clearTimeout(timer);
  }
}

/**
 * Hook générique : GET au montage, refresh manuel.
 */
export function useGet<T>(path: string, deps: unknown[] = []): ApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const d = await apiFetch<T>(path, { method: 'GET' }, 20000, abortRef.current.signal);
      setData(d);
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return;
      setError(e as ApiError);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);

  useEffect(() => {
    void load();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [load]);

  return { data, error, loading, refresh: load };
}

/**
 * Hook POST — retourne une fonction d'envoi.
 */
export function usePost<TBody, TResp>() {
  const [data, setData] = useState<TResp | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  const send = useCallback(async (path: string, body: TBody): Promise<TResp | null> => {
    setLoading(true);
    setError(null);
    try {
      const d = await apiFetch<TResp>(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setData(d);
      return d;
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return null;
      setError(e as ApiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, error, loading, send };
}

export { apiFetch };