import { useState, useEffect, useCallback } from 'react';

// ============================================================
// Types
// ============================================================

interface ModelEntry {
  id: string;
  name?: string;
  provider?: string;
  free?: boolean;
  free_type?: string;
  pricing?: { prompt?: string; completion?: string };
  context_length?: number | null;
}

interface ModelStatus {
  status: 'available' | 'unavailable' | 'unknown';
  error: string | null;
}

interface ProviderMeta {
  total: number;
  free: number;
  paid: number;
}

type ProviderList = ModelEntry[] | { error: string } | string[];

interface ModelsByProvider {
  gemini?: ProviderList;
  groq?: ProviderList;
  openrouter?: ProviderList;
  nvidia?: ProviderList;
  ollama?: ProviderList;
  gemini_meta?: ProviderMeta;
  groq_meta?: ProviderMeta;
  openrouter_meta?: ProviderMeta;
  nvidia_meta?: ProviderMeta;
  ollama_meta?: ProviderMeta;
  cached?: boolean;
  age_sec?: number;
}

interface StatusByProvider {
  gemini?: Record<string, ModelStatus>;
  groq?: Record<string, ModelStatus>;
  openrouter?: Record<string, ModelStatus>;
  nvidia?: Record<string, ModelStatus>;
  ollama?: Record<string, ModelStatus>;
  cached?: boolean;
  age_sec?: number;
}

interface Props {
  value: string;
  onChange: (model: string, provider: string) => void;
}

// ============================================================
// Helpers
// ============================================================

function normalizeEntry(m: ModelEntry | string): ModelEntry {
  if (typeof m === 'string') {
    return { id: m, name: m, free: true };
  }
  return m;
}

function isFreeModel(m: ModelEntry): boolean {
  if (m.free === true) return true;
  const p = m.pricing?.prompt;
  const c = m.pricing?.completion;
  if (p === '0' && c === '0') return true;
  if (p === 'credits' || c === 'credits') return true;
  return false;
}

function formatContext(ctx: number | null | undefined): string {
  if (!ctx) return '';
  if (ctx >= 1_000_000) return `${(ctx / 1_000_000).toFixed(1)}M`;
  if (ctx >= 1000) return `${Math.round(ctx / 1000)}K`;
  return `${ctx}`;
}

function statusIcon(st: ModelStatus | undefined): string {
  if (!st) return '❓';
  if (st.status === 'available') return '✅';
  if (st.status === 'unavailable') return '⏸️';
  return '❔';
}

function statusTooltip(st: ModelStatus | undefined): string {
  if (!st) return 'Statut inconnu';
  if (st.status === 'available') return 'Disponible';
  if (st.status === 'unavailable') {
    const reasons: Record<string, string> = {
      rate_limit: 'Quota temporairement épuisé',
      payment_required: 'Crédit requis',
      model_not_found: 'Modèle introuvable',
      non_chat_model: 'Modèle non-chat',
      non_text_output: 'Sortie non-texte',
      bad_request: 'Requête invalide',
      timeout: 'Timeout',
      empty_response: 'Réponse vide',
    };
    return reasons[st.error || ''] || `Indisponible (${st.error || 'inconnu'})`;
  }
  return `Statut inconnu (${st.error || '?'})`;
}

// ============================================================
// Composant
// ============================================================

function deriveProvider(modelId: string): string {
  if (!modelId) return 'auto';
  if (modelId.startsWith('groq/'))     return 'groq';
  if (modelId.startsWith('gemini'))    return 'gemini';
  if (modelId.startsWith('claude'))    return 'anthropic';
  if (modelId.startsWith('gpt'))       return 'openai';
  if (modelId.startsWith('mistral'))   return 'mistral';
  if (modelId.startsWith('qwen'))      return 'qwen';
  if (modelId.startsWith('deepseek'))  return 'deepseek';
  if (modelId.startsWith('ollama/'))   return 'ollama';
  // fallback : tout ce qui contient un slash = "provider/model"
  if (modelId.includes('/'))           return modelId.split('/')[0];
  return 'auto';
}

export function ModelSelector({ value, onChange }: Props) {
  const [models, setModels] = useState<ModelsByProvider>({});
  const [statuses, setStatuses] = useState<StatusByProvider>({});
  const [loading, setLoading] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const qs = force ? '?force_refresh=true' : '';
      const [modelsRes, statusRes] = await Promise.all([
        fetch(`http://127.0.0.1:8001/api/models/all${qs}`),
        fetch(`http://127.0.0.1:8001/api/models/status${qs}`).catch(() => null),
      ]);
      const modelsData = await modelsRes.json();
      setModels(modelsData);

      if (statusRes && statusRes.ok) {
        const statusData = await statusRes.json();
        setStatuses(statusData);
      }

      // Auto-selection du premier modele gratuit si value est vide
      if (!value) {
        const firstFree = findFirstFreeModel(modelsData);
        if (firstFree) {
          onChange(firstFree, deriveProvider(firstFree));
        }
      }

      setLastUpdate(Date.now());
    } catch (e) {
      console.error('ModelSelector load failed:', e);
    } finally {
      setLoading(false);
    }
  }, [value, onChange]);

  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), 3600_000);
    return () => clearInterval(timer);
  }, [load]);

  const secondsAgo = lastUpdate
    ? Math.round((Date.now() - lastUpdate) / 1000)
    : 0;

  const renderProvider = (name: string, list: ProviderList | undefined) => {
    if (!list) return null;

    if (!Array.isArray(list)) {
      return (
        <optgroup key={name} label={`${name.toUpperCase()} (erreur)`}>
          <option disabled>⚠️ {list.error || 'indisponible'}</option>
        </optgroup>
      );
    }

    const entries = list.map(normalizeEntry);
    const filtered = freeOnly ? entries.filter(isFreeModel) : entries;

    if (filtered.length === 0) return null;

    const providerStatuses = (statuses as Record<string, Record<string, ModelStatus>>)[name] || {};
    const available = filtered.filter(m => {
      const st = providerStatuses[m.id];
      return !st || st.status === 'available';
    }).length;
    const total = filtered.length;

    const label = `${name.toUpperCase()} (${available}/${total} disponibles)`;

    return (
      <optgroup key={name} label={label}>
        {filtered.map((m) => {
          const st = providerStatuses[m.id];
          const isUnavailable = st?.status === 'unavailable';
          const icon = statusIcon(st);
          const free = isFreeModel(m);
          const freeIcon = free ? '🆓' : '💎';
          const ctx = formatContext(m.context_length);

          const parts = [icon, freeIcon, m.id];
          if (ctx) parts.push(`[${ctx}]`);
          const optionLabel = parts.join(' ');

          return (
            <option
              key={`${name}-${m.id}`}
              value={m.id}
              title={statusTooltip(st)}
              disabled={isUnavailable}
            >
              {optionLabel}
            </option>
          );
        })}
      </optgroup>
    );
  };

  return (
    <div
      className="model-selector"
      style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
    >
      <label
        style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
        }}
        title="Afficher uniquement les modèles gratuits"
      >
        <input
          type="checkbox"
          checked={freeOnly}
          onChange={(e) => setFreeOnly(e.target.checked)}
        />
        🆓
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value, deriveProvider(e.target.value))}
        style={{
          minWidth: 380,
          background: 'var(--bg-primary, #1a1a1a)',
          color: 'var(--text-primary, #fff)',
          border: '1px solid var(--border-subtle, #333)',
          borderRadius: 6,
          padding: '6px 10px',
          fontSize: 12,
          fontFamily: 'monospace',
        }}
      >
        <option value="">— Sélectionner un modèle —</option>
        {Object.entries(models).map(([provider, list]) => {
          if (
            provider === 'cached' ||
            provider === 'age_sec' ||
            provider === 'ts' ||
            provider.endsWith('_meta')
          ) {
            return null;
          }
          return renderProvider(provider, list as ProviderList);
        })}
      </select>

      <button
        onClick={() => load(true)}
        disabled={loading}
        title="Rafraîchir la liste"
        style={{
          padding: '6px 10px',
          borderRadius: 6,
          border: '1px solid var(--border-subtle, #333)',
          background: 'var(--bg-secondary, #2a2a2a)',
          color: 'var(--text-primary, #fff)',
          cursor: loading ? 'wait' : 'pointer',
        }}
      >
        {loading ? '⏳' : '🔄'}
      </button>

      {lastUpdate > 0 && (
        <span
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
          }}
        >
          {secondsAgo}s
        </span>
      )}
    </div>
  );
}

// ============================================================
// Helper : premier modele gratuit disponible
// ============================================================

function findFirstFreeModel(models: ModelsByProvider): string | null {
  const preferredOrder = ['gemini', 'groq', 'nvidia', 'openrouter', 'ollama'];
  for (const provider of preferredOrder) {
    const list = models[provider as keyof ModelsByProvider];
    if (!Array.isArray(list)) continue;
    const entries = list.map(normalizeEntry);
    const free = entries.filter(isFreeModel);
    if (free.length > 0) {
      return free[0].id;
    }
  }
  return null;
}
