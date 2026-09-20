import { useState, useEffect } from 'react';

// Nouveau format : objets enrichis avec prix/free/contexte
interface ModelEntry {
  id: string;
  name?: string;
  provider?: string;
  free?: boolean;
  pricing?: { prompt?: string; completion?: string };
  context_length?: number | null;
}

type ProviderList = ModelEntry[] | { error: string } | string[];

interface ModelsByProvider {
  gemini?: ProviderList;
  groq?: ProviderList;
  openrouter?: ProviderList;
  nvidia?: ProviderList;
  ollama?: ProviderList;
  cached?: boolean;
  age_sec?: number;
}

interface Props {
  value: string;
  onChange: (model: string) => void;
}

// --- Helpers d'affichage ---

function normalizeEntry(m: ModelEntry | string): ModelEntry {
  if (typeof m === 'string') {
    return { id: m, name: m, free: true };  // assume free par defaut pour strings
  }
  return m;
}

function isFreeModel(m: ModelEntry): boolean {
  // Un modele est gratuit si :
  //   - free: true explicite
  //   - pricing.prompt === "0" ET pricing.completion === "0"
  //   - pricing.prompt === "credits" (NVIDIA)
  if (m.free === true) return true;
  const p = m.pricing?.prompt;
  const c = m.pricing?.completion;
  if (p === "0" && c === "0") return true;
  if (p === "credits" || c === "credits") return true;
  return false;
}

function findFirstFreeModel(models: ModelsByProvider): string | null {
  // Auto-sélectionne le premier modèle gratuit disponible
  // Ordre de préférence : gemini, groq, nvidia, openrouter, ollama
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

function formatContext(ctx: number | null | undefined): string {
  if (!ctx) return '';
  if (ctx >= 1_000_000) return `${(ctx / 1_000_000).toFixed(1)}M`;
  if (ctx >= 1000) return `${Math.round(ctx / 1000)}K`;
  return `${ctx}`;
}

function formatPrice(pricing?: { prompt?: string; completion?: string }): string {
  if (!pricing) return '';
  const p = pricing.prompt;
  const c = pricing.completion;
  if (!p || !c) return '';
  if (p === '0' && c === '0') return 'gratuit';
  if (p === 'credits') return 'crédits';

  const parse = (s: string) => {
    const v = parseFloat(s);
    return isNaN(v) ? null : v * 1_000_000;
  };
  const pin = parse(p);
  const pout = parse(c);
  if (pin === null || pout === null) return '';

  // Si prix très bas (<0.01), afficher en millicents
  const fmt = (v: number) => {
    if (v === 0) return '0';
    if (v < 0.01) return v.toFixed(4);
    if (v < 1) return v.toFixed(3);
    return v.toFixed(2);
  };
  return `$${fmt(pin)}/$${fmt(pout)}/M`;
}

// --- Composant ---

export function ModelSelector({ value, onChange }: Props) {
  const [models, setModels] = useState<ModelsByProvider>({});
  const [loading, setLoading] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);

  const load = async (force = false) => {
    setLoading(true);
    try {
      const r = await fetch(`http://127.0.0.1:8001/api/models/all${force ? '?force_refresh=true' : ''}`);
      const data = await r.json();
      setModels(data);

      // Auto-sélection du premier modèle gratuit si value est vide
      // Corrige l'incohérence "auto" → modèles différents côté backend
      if (!value) {
        const firstFree = findFirstFreeModel(data);
        if (firstFree) {
          onChange(firstFree);
        }
      }
    } catch (e) {
      console.error('ModelSelector load failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), 3600_000);
    return () => clearInterval(timer);
  }, []);

  const renderProvider = (name: string, list: ProviderList | undefined) => {
    if (!list) return null;

    // Erreur
    if (!Array.isArray(list)) {
      return (
        <optgroup key={name} label={`${name.toUpperCase()} (erreur)`}>
          <option disabled>⚠️ {list.error || 'indisponible'}</option>
        </optgroup>
      );
    }

    // Normaliser chaque entrée
    const entries = list.map(normalizeEntry);

    // EXCLURE TOUJOURS les modèles payants
    const freeEntries = entries.filter(isFreeModel);

    // Si l'utilisateur a coché "free only", on garde seulement les 100% gratuits
    // (mais on n'affiche déjà que ceux-là donc c'est identique)
    const filtered = freeOnly ? freeEntries : entries;

    if (filtered.length === 0) return null;

    const labelSuffix = `(${filtered.length})`;

    return (
      <optgroup key={name} label={`${name.toUpperCase()} ${labelSuffix}`}>
        {filtered.map((m) => {
          const icon = m.free ? '🆓' : (m.provider === 'ollama' ? '🏠' : m.provider === 'nvidia' ? '⚡' : '💎');
          const ctx = formatContext(m.context_length);
          const price = formatPrice(m.pricing);

          const parts = [icon, m.id];
          if (ctx) parts.push(`[${ctx}]`);
          if (price && price !== 'gratuit') parts.push(`· ${price}`);

          const label = parts.join(' ');

          return (
            <option key={`${name}-${m.id}`} value={m.id} title={label}>
              {label}
            </option>
          );
        })}
      </optgroup>
    );
  };

  return (
    <div className="model-selector" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <label
        style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
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
        onChange={(e) => onChange(e.target.value)}
        style={{
          minWidth: 360,
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
          if (provider === 'cached' || provider === 'age_sec' || provider === 'ts') return null;
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
    </div>
  );
}