import { useEffect, useRef, useState } from 'react';
import { Mission } from '../types';

// Ecoute les mises a jour de mission en temps reel via Server-Sent Events
// plutot que du polling. Le document d'architecture E-zzio mentionne
// LangGraph + streaming SSE cote backend - SI cette route existe reellement,
// ce hook evite un polling qui donnerait une fausse impression de "temps reel"
// avec plusieurs secondes de latence.
// A verifier avant usage: l'URL exacte de l'endpoint SSE cote E-zzio.
export function useMissionEvents(baseUrl: string, missionId?: string) {
  const [lastUpdate, setLastUpdate] = useState<Mission | null>(null);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!missionId) return;

    const url = `${baseUrl}/missions/${missionId}/events`;
    const source = new EventSource(url);
    sourceRef.current = source;

    source.onmessage = (event) => {
      try {
        setLastUpdate(JSON.parse(event.data) as Mission);
      } catch {
        // payload non-JSON ignore volontairement
      }
    };

    source.onerror = () => {
      source.close();
    };

    return () => source.close();
  }, [baseUrl, missionId]);

  return lastUpdate;
}
