/**
 * useVisibilityAwareInterval — setInterval qui ne tick PAS si :
 *   - l'onglet est caché (document.hidden)
 *   - la prop `enabled` est false
 *
 * Remplace tous les setInterval existants pour éviter le spam.
 */
import { useEffect, useRef } from 'react';

export function useVisibilityAwareInterval(
  callback: () => void,
  intervalMs: number,
  enabled: boolean = true
) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      savedCallback.current();
    };

    // Tick initial immédiat
    tick();

    const id = window.setInterval(tick, intervalMs);

    const onVisibilityChange = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        tick();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [intervalMs, enabled]);
}