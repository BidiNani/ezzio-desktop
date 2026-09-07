// NOTE IMPORTANTE : ces types et les noms de champs sont des HYPOTHESES
// raisonnables, pas une verification du backend E-zzio reel.
// Avant de brancher useEzzioApi sur le vrai serveur, inspecte
// core/main.py / web_server.py pour confirmer les routes et le shape
// exact des reponses JSON, et ajuste ce fichier en consequence.

export type MissionStatus = 'running' | 'pending' | 'completed' | 'failed' | 'paused' | 'cancelled';
export type ProviderStatus = 'online' | 'degraded' | 'offline';
export type WorldModelFreshness = 'fresh' | 'aging' | 'stale';
export type GoalStatus = 'on_track' | 'at_risk' | 'delayed' | 'completed';

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
}

export interface ServerConfig {
  address: string;
  port: number;
  connected: boolean;
  lastPing?: string;
}
