/* eslint-disable @typescript-eslint/no-unused-vars -- exports publics consommes par d'autres modules */
// Normalizers : transforment les reponses brutes du backend en types applicatifs.
// Extraits de useEzzioApi.ts (refactor 2026-09-19).

import type { Mission, ApprovalRequest, SystemHealth, ProviderHealth, Risk } from '../types';
import type { BackendMission, BackendApproval, BackendProviderHealth } from './types';

export function normalizeMission(raw: BackendMission): Mission {
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


export function normalizeApproval(raw: BackendApproval): ApprovalRequest {
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


export function normalizeProvider(
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
