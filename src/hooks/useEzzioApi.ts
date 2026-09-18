import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
  Mission,
  ApprovalRequest,
  Goal,
  SystemHealth,
  ProviderHealth,
  Risk,
  ResearchResult,
  MemoryItem,
} from '../types';
import type {
  BackendMission,
  BackendApproval,
  BackendProvidersResponse,
  MasterChatResponse,
} from '../api/types';
import {
  normalizeMission,
  normalizeApproval,
  normalizeProvider,
} from '../api/normalizers';
import { DEFAULT_PORT, PING_INTERVAL_MS } from '../api/client';

export const MOCK_MODE = false;

export function useEzzioApi() {
  const [serverConfig, setServerConfig] = useState({
    address: localStorage.getItem('ezzio_server_address') ?? '127.0.0.1',
    port: Number(
      localStorage.getItem('ezzio_server_port') ?? DEFAULT_PORT
    ),
    connected: false,
  });

  const [error, setError] = useState<string | null>(null);
  const pingTimer = useRef<number | null>(null);

  const getBaseUrl = useCallback(
    () => `http://${serverConfig.address}:${serverConfig.port}`,
    [serverConfig.address, serverConfig.port]
  );

  const failureCount = useRef(0);

  const request = useCallback(
    async <T,>(
      endpoint: string,
      options?: RequestInit
    ): Promise<T | null> => {
      try {
        const res = await fetch(`${getBaseUrl()}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': (typeof localStorage !== 'undefined'
              ? localStorage.getItem('ezzio_api_key') : '') ?? '',
            ...options?.headers,
          },
        });

        if (!res.ok) {
          let detail = `HTTP ${res.status}`;
          try {
            const payload = (await res.json()) as {
              detail?: string;
            };
            if (payload.detail) detail = `${detail}: ${payload.detail}`;
          } catch {
            // Réponse non JSON : conserver l'erreur HTTP.
          }
          throw new Error(detail);
        }

        failureCount.current = 0;
        setServerConfig((prev) => (prev.connected ? prev : { ...prev, connected: true }));
        setError(null);

        return (await res.json()) as T;
      } catch (err) {
        failureCount.current += 1;
        // On ne déclare offline qu'après 2 échecs consécutifs pour éviter le clignotement
        if (failureCount.current >= 2) {
          setServerConfig((prev) => (!prev.connected ? prev : { ...prev, connected: false }));
          setError(err instanceof Error ? err.message : 'Erreur réseau');
        }
        return null;
      }
    },
    [getBaseUrl]
  );

  const ping = useCallback(async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      failureCount.current = 0;
      setServerConfig((prev) => (prev.connected ? prev : { ...prev, connected: true }));
      setError(null);

      return { status: 'ONLINE' };
    } catch (err) {
      failureCount.current += 1;
      if (failureCount.current >= 2) {
        setServerConfig((prev) => (!prev.connected ? prev : { ...prev, connected: false }));
        setError(err instanceof Error ? err.message : 'Backend indisponible');
      }
      return null;
    }
  }, [getBaseUrl]);

   useEffect(() => {
     // pingRef garantit qu'on appelle toujours la dernière version de ping
     // sans recréer l'interval à chaque render (le bug [ping]).
     const pingRef = { current: ping };
     pingRef.current = ping;
     void pingRef.current();

     pingTimer.current = window.setInterval(() => {
       if (typeof document !== 'undefined' && document.hidden) return;
       void pingRef.current();
     }, PING_INTERVAL_MS);

     return () => {
       if (pingTimer.current !== null) {
         window.clearInterval(pingTimer.current);
         pingTimer.current = null;
       }
     };
   }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setServerAddress = useCallback((address: string) => {
    localStorage.setItem('ezzio_server_address', address);
    setServerConfig((prev) => ({
      ...prev,
      address,
      connected: false,
    }));
  }, []);

  const setServerPort = useCallback((port: number) => {
    localStorage.setItem('ezzio_server_port', String(port));
    setServerConfig((prev) => ({
      ...prev,
      port,
      connected: false,
    }));
  }, []);

  const getMissions = useCallback(async (): Promise<Mission[]> => {
    const data = await request<{
      ok: boolean;
      missions: BackendMission[];
      active: BackendMission[];
      total: number;
    }>('/master/missions');

    return data?.missions?.map(normalizeMission) ?? [];
  }, [request]);

  const getMission = useCallback(
    async (id: string): Promise<Mission | null> => {
      const missions = await getMissions();
      return missions.find((mission) => mission.id === id) ?? null;
    },
    [getMissions]
  );

  const getApprovals = useCallback(
    async (): Promise<ApprovalRequest[]> => {
      const data = await request<{
        ok: boolean;
        pending_approvals: BackendApproval[];
        total: number;
      }>('/master/approvals/pending');

      return data?.pending_approvals?.map(normalizeApproval) ?? [];
    },
    [request]
  );

  const decideApproval = useCallback(
    async (
      approvalId: string,
      decision: 'APPROVE' | 'REJECT',
      reason?: string
    ) => {
      return request<{
        ok: boolean;
        approval_id: string;
        status: string;
        decided_by: string;
        decided_at: string;
        reason?: string;
      }>(`/master/approvals/${approvalId}/decide`, {
        method: 'POST',
        body: JSON.stringify({
          decision,
          decided_by: 'desktop_user',
          reason,
        }),
      });
    },
    [request]
  );

  const approveMission = useCallback(
    async (id: string) => {
      const result = await decideApproval(id, 'APPROVE');
      return { success: result?.ok === true, result };
    },
    [decideApproval]
  );

  const rejectMission = useCallback(
    async (id: string) => {
      const result = await decideApproval(id, 'REJECT');
      return { success: result?.ok === true, result };
    },
    [decideApproval]
  );

  const getGoals = useCallback(async (): Promise<Goal[]> => {
    // Aucun endpoint Goals canonique n'a été prouvé.
    // Ne pas inventer d'API ni générer de fausses données.
    return [];
  }, []);

  const getHealth = useCallback(async (): Promise<SystemHealth> => {
    const [providersData, diagnostics] = await Promise.all([
      request<BackendProvidersResponse>('/master/providers/health'),
      request<{
        ok?: boolean;
        audit_ledger?: {
          status?: string;
        };
      }>('/master/system/diagnostics'),
    ]);

    const timestamp =
      providersData?.health?.timestamp ?? Date.now() / 1000;

    const providers = Object.entries(
      providersData?.health?.providers ?? {}
    ).map(([name, provider]) =>
      normalizeProvider(name, provider, timestamp)
    );

    const risks: Risk[] = [];

    if (
      diagnostics?.audit_ledger?.status &&
      diagnostics.audit_ledger.status !== 'SECURE'
    ) {
      risks.push({
        id: 'audit-ledger-degraded',
        description: `Audit ledger : ${diagnostics.audit_ledger.status}`,
        severity: 'high',
      });
    }

    for (const provider of providers) {
      if (provider.status === 'offline') {
        risks.push({
          id: `provider-offline-${provider.name}`,
          description: `${provider.name} est indisponible.`,
          severity: 'high',
        });
      } else if (provider.status === 'degraded') {
        risks.push({
          id: `provider-degraded-${provider.name}`,
          description: `${provider.name} est dégradé.`,
          severity: 'medium',
        });
      }
    }

    return {
      providers,
      worldModelFreshness: 'fresh',
      risks,
    };
  }, [request]);

  const sendChat = useCallback(
    async (text: string, sessionId: string, forceCloud = true) => {
      const result = await request<MasterChatResponse>(
        '/master/chat',
        {
          method: 'POST',
          body: JSON.stringify({
            text,
            speed: 'auto',
            force_cloud: forceCloud,
            mission_profile: 'STANDARD',
            model_target: 'auto',
            channel: 'desktop',
            session_id: sessionId,
          }),
        }
      );

      return result;
    },
    [request]
  );

  const searchResearch = useCallback(
    async (query: string, mode: 'fast' | 'deep' | 'local' = 'fast'): Promise<ResearchResult | null> => {
      const data = await request<{
        task_id: string;
        mode: string;
        provider: string;
        data: Record<string, unknown>;
      }>('/api/v1/research/search', {
        method: 'POST',
        body: JSON.stringify({ query, mode }),
      });

      if (!data) return null;

      return {
        taskId: data.task_id,
        mode: data.mode,
        provider: data.provider,
        data: data.data,
      };
    },
    [request]
  );

  const getMemoryRecent = useCallback(
    async (limit = 20): Promise<MemoryItem[]> => {
      const data = await request<{ items: MemoryItem[] }>(`/memory/recent?limit=${limit}`);
      return data?.items ?? [];
    },
    [request]
  );

  const searchMemory = useCallback(
    async (query: string, limit = 10): Promise<MemoryItem[]> => {
      const data = await request<{ results?: MemoryItem[]; items?: MemoryItem[] }>('/memory/search', {
        method: 'POST',
        body: JSON.stringify({ query, limit }),
      });
      return data?.results ?? data?.items ?? [];
    },
    [request]
  );

  const pauseMission = useCallback(
    async (missionId: string) => {
      return request<{ ok: boolean; mission_id: string; status: string }>(
        `/master/missions/${missionId}/pause`,
        { method: 'POST' }
      );
    },
    [request]
  );

  const resumeMission = useCallback(
    async (missionId: string) => {
      return request<{ ok: boolean; mission_id: string; status: string }>(
        `/master/missions/${missionId}/resume`,
        { method: 'POST' }
      );
    },
    [request]
  );

  const getGovernanceSettings = useCallback(async () => {
    return request<{
      ok: boolean;
      settings: {
        local_only: boolean;
        cloud_fallback: boolean;
        max_budget_cents: number;
        profiles: Record<string, string>;
      };
      registered_models_count: number;
      available_local_roles: string[];
    }>('/master/governance/settings');
  }, [request]);

  const updateGovernanceSettings = useCallback(
    async (payload: { local_only?: boolean; cloud_fallback?: boolean; max_budget_cents?: number }) => {
      return request<{
        ok: boolean;
        settings: {
          local_only: boolean;
          cloud_fallback: boolean;
          max_budget_cents: number;
          profiles: Record<string, string>;
        };
      }>('/master/governance/settings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    [request]
  );

  return useMemo(() => ({
      serverConfig,
      error,
      setServerAddress,
      setServerPort,
      ping,
      getMissions,
      getMission,
      pauseMission,
      resumeMission,
      getApprovals,
      approveMission,
      rejectMission,
      getGoals,
      getHealth,
      sendChat,
      searchResearch,
      getMemoryRecent,
      searchMemory,
      getGovernanceSettings,
      updateGovernanceSettings,
  }), [
    serverConfig, error, setServerAddress, setServerPort, ping, getMissions, getMission, pauseMission, resumeMission, getApprovals, approveMission, rejectMission, getGoals, getHealth, sendChat, searchResearch, getMemoryRecent, searchMemory, getGovernanceSettings, updateGovernanceSettings
  ]);
}