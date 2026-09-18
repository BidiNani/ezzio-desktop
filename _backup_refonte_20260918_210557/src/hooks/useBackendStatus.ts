/**
 * useBackendStatus — polling /health toutes les 10s.
 * Retourne { online: boolean, lastCheck: Date | null, latency: number | null }.
 */
import { useEffect, useState } from 'react';
import { API_BASE } from './useApi';

export interface BackendStatus {
  online: boolean;
  lastCheck: Date | null;
  latency: number | null;
}

export function useBackendStatus(intervalMs = 30000): BackendStatus {
  const [status, setStatus] = useState<BackendStatus>({
    online: false, lastCheck: null, latency: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const t0 = performance.now();
      try {
        const r = await fetch(`${API_BASE}/health`, {
          signal: AbortSignal.timeout(3000),
        });
        const ms = Math.round(performance.now() - t0);
        if (!cancelled) {
          setStatus({
            online: r.ok,
            lastCheck: new Date(),
            latency: r.ok ? ms : null,
          });
        }
      } catch {
        if (!cancelled) {
          setStatus({ online: false, lastCheck: new Date(), latency: null });
        }
      }
    }

    void check();
    const id = window.setInterval(check, intervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [intervalMs]);

  return status;
}