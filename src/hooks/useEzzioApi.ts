import { useState, useEffect, useCallback, useRef } from 'react';
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

export const MOCK_MODE = false;

const DEFAULT_PORT = 8001;
const PING_INTERVAL_MS = 15000;

interface BackendMission {
  id?: string;
  mission_id?: string;
  title?: string;
  name?: string;
  description?: string;
  status?: string;
  progress?: number;
  isCritical?: boolean;
  risk_level?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  tasks?: Array<{
    id?: string;
    task_id?: string;
    title?: string;
    name?: string;
    status?: string;
    completed?: boolean;
  }>;
}

interface BackendApproval {
  approval_id: string;
  task_id: string;
  capability_name: string;
  scope: string;
  safe_summary: string;
  requested_at: string;
  expires_at: string;
  time_remaining_sec: number;
  status: string;
}

interface BackendProviderHealth {
  online?: boolean;
  latency_ms?: number;
  configured?: boolean;
  error?: string | null;
  status?: string;
}

interface BackendProvidersResponse {
  ok: boolean;
  health: {
    timestamp: number;
    providers: Record<string, BackendProviderHealth>;
  };
}

interface MasterChatResponse {
  response?: string;
  answer?: string;
  content?: string;
  message?: string;
  source?: string;
  model?: string;
  provider?: string;
  channel?: string;
  mission?: string;
  ok?: boolean;
}

function normalizeMission(raw: BackendMission): Mission {
  const id = raw.id ?? raw.mission_id ?? `mission-${Date.now()}`;
  const title = raw.title ?? raw.name ?? id;
  const description = raw.description ?? '';
  const rawStatus = (raw.status ?? 'pending').toUpperCase();

  let status: Mission['status'] = 'pending';

  if (['RUNNING', 'EXECUTING', 'ACTIVE', 'WORKING'].includes(rawStatus)) {
    status = 'running';
  } else if (['COMPLETED', 'DONE', 'SUCCESS'].includes(rawStatus)) {
    status = 'completed';
  } else if (['FAILED', 'ERROR'].includes(rawStatus)) {
    status = 'failed';
  } else if (['PAUSED'].includes(rawStatus)) {
    status = 'paused';
  } else if (['CANCELLED', 'CANCELED'].includes(rawStatus)) {
    status = 'cancelled';
  }

  const subtasks = (raw.tasks ?? []).map((task, index) => ({
    id: task.id ?? task.task_id ?? `${id}-task-${index + 1}`,
    title: task.title ?? task.name ?? `Task ${index + 1}`,
    completed:
      task.completed ??
      ['COMPLETED', 'DONE', 'SUCCESS'].includes(
        (task.status ?? '').toUpperCase()
      ),
  }));

  return {
    id,
    title,
    description,
    status,
    progress:
      typeof raw.progress === 'number'
        ? Math.max(0, Math.min(100, raw.progress))
        : subtasks.length > 0
          ? Math.round(
              (subtasks.filter((task) => task.completed).length /
                subtasks.length) *
                100
            )
          : status === 'completed'
            ? 100
            : 0,
    isCritical:
      raw.isCritical === true ||
      ['HIGH', 'CRITICAL'].includes((raw.risk_level ?? '').toUpperCase()),
    subtasks,
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? raw.updated_at ?? new Date().toISOString(),
  };
}

function normalizeApproval(raw: BackendApproval): ApprovalRequest {
  return {
    id: raw.approval_id,
    missionId: raw.task_id,
    missionTitle: raw.capability_name,
    context: raw.scope,
    requestedAction: raw.safe_summary,
    reversible: true,
    createdAt: raw.requested_at,
  };
}

function normalizeProvider(
  name: string,
  data: BackendProviderHealth,
  timestamp: number
): ProviderHealth {
  const status: ProviderHealth['status'] =
    data.online === true
      ? 'online'
      : data.status === 'DEGRADED'
        ? 'degraded'
        : 'offline';

  return {
    name,
    status,
    latencyMs:
      typeof data.latency_ms === 'number' ? data.latency_ms : undefined,
    lastCheck: new Date(timestamp * 1000).toISOString(),
  };
}

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
    void ping();

    pingTimer.current = window.setInterval(() => {
      void ping();
    }, PING_INTERVAL_MS);

    return () => {
      if (pingTimer.current !== null) {
        window.clearInterval(pingTimer.current);
      }
    };
  }, [ping]);

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

  return {
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
  };
}