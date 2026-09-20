export type MissionStatus = 'running' | 'pending' | 'completed' | 'failed' | 'paused' | 'cancelled';
export type ProviderStatus = 'online' | 'degraded' | 'offline';
export type WorldModelFreshness = 'fresh' | 'aging' | 'stale';
export type GoalStatus = 'on_track' | 'at_risk' | 'delayed' | 'completed';

export type TabId =
  | 'chat'
  | 'missions'
  | 'approvals'
  | 'goals'
  | 'projects'
  | 'files'
  | 'research'
  | 'automations'
  | 'memory'
  | 'accounts'
  | 'health'
  | 'settings';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  status: MissionStatus;
  progress: number; // 0-100
  isCritical: boolean;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
  logs?: LogEntry[];
}

export interface ApprovalRequest {
  id: string;
  missionId: string;
  missionTitle: string;
  context: string;
  requestedAction: string;
  reversible: boolean;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  deadline: string;
  status: GoalStatus;
  missionIds: string[];
  progress: number;
}

export interface ProviderHealth {
  name: string;
  status: ProviderStatus;
  latencyMs?: number;
  lastCheck: string;
}

export interface Risk {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability?: number;
  mitigation?: string;
}

export interface SystemHealth {
  providers: ProviderHealth[];
  worldModelFreshness: WorldModelFreshness;
  risks: Risk[];
  auditLedgerStatus?: string;
  agentCount?: number;
}

export interface ServerConfig {
  address: string;
  port: number;
  connected: boolean;
  lastPing?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  provider?: string;
  status?: 'sending' | 'success' | 'error';
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    thoughts_tokens?: number;
  };
  thinking_level?: string | null;
}

export interface ResearchResult {
  taskId: string;
  mode: string;
  provider: string;
  data: Record<string, unknown>;
}

export interface MemoryItem {
  id?: string;
  content?: string;
  text?: string;
  role?: string;
  timestamp?: string;
  session_id?: string;
  metadata?: Record<string, unknown>;
}
