/**
 * useBackendStatus — polling /health conscient du cycle de vie.
 * Pause si l'onglet est caché (document.hidden).
 */
import { useCallback, useState } from 'react';
import { usePolling } from './usePolling';
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

  const check = useCallback(async () => {
    const t0 = performance.now();
    try {
      const r = await fetch(`${API_BASE}/health`, {
        signal: AbortSignal.timeout(3000),
      });
      const ms = Math.round(performance.now() - t0);
      setStatus({
        online: r.ok,
        lastCheck: new Date(),
        latency: r.ok ? ms : null,
      });
    } catch {
      setStatus({ online: false, lastCheck: new Date(), latency: null });
    }
  }, []);

  usePolling(check, intervalMs, true);

  return status;
}