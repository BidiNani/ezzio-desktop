// Types internes du backend E-ZZIO (contrats bruts renvoyes par l'API).
// Ne pas confondre avec ../types qui contient les types applicatifs normalises.

export interface BackendMission {
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

export interface BackendApproval {
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

export interface BackendProviderHealth {
  online?: boolean;
  latency_ms?: number;
  configured?: boolean;
  error?: string | null;
  status?: string;
}

export interface BackendProvidersResponse {
  health?: {
    timestamp?: number;
    providers?: Record<string, BackendProviderHealth>;
  };
}

export interface MasterChatResponse {
  ok?: boolean;
  text?: string;
  session_id?: string;
  [key: string]: unknown;
}