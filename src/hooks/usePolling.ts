import { useEffect, useRef } from 'react';

/**
 * usePolling - polling robuste, conscient du cycle de vie.
 *
 * Ne tick PAS si :
 *   - enabled === false (composant inactif)
 *   - document.hidden (onglet caché)
 *
 * Relance immédiatement quand l'onglet redevient visible
 * ou quand enabled passe de false à true.
 */
export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled: boolean = true,
): void {
  const savedCallback = useRef(callback);

  // Toujours garder la dernière version du callback sans relancer l'interval
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      if (typeof document !== 'undefined' && document.hidden) return;
      void savedCallback.current();
    };

    // Tick initial immédiat (async pour ne pas bloquer le render)
    const initialId = window.setTimeout(tick, 0);

    const intervalId = window.setInterval(tick, intervalMs);

    const onVisibilityChange = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        tick();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      window.clearTimeout(initialId);
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [intervalMs, enabled]);
}