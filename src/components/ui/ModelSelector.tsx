import { useState, useEffect, useRef } from 'react';

interface Model {
  model_id: string;
  display_name: string;
  available_keys?: string[];
  tier: string;
  quality: number;
  desc: string;
}

interface ActiveModel {
  provider: string;
  model_id: string;
  display_name: string;
}

const API = 'http://127.0.0.1:8001';

const PROVIDER_ICONS: Record<string, string> = {
  gemini: '◆',
  ollama: '⬢',
  groq: '⚡',
  openrouter: '⇄',
};

export function ModelSelector() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ActiveModel | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [ollama, setOllama] = useState<Model[]>([]);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API}/api/models`)
      .then(r => r.json())
      .then(d => {
        setActive(d.active);
        setModels(d.gemini || []);
        setOllama(d.ollama || []);
      })
      .catch(console.error);
  }, []);

  // Fermer au clic extérieur
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const select = async (provider: string, modelId: string) => {
    setSaving(true);
    try {
      const r = await fetch(`${API}/api/models/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, model_id: modelId }),
      });
      const json = await r.json();
      if (json.ok) {
        setActive(json.active);
        setOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!active) return null;

  const icon = PROVIDER_ICONS[active.provider] || '○';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 12,
          color: 'var(--text-primary)',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
      >
        <span style={{ color: 'var(--accent-blue)', fontSize: 14 }}>{icon}</span>
        <span style={{ fontWeight: 500 }}>{active.display_name}</span>
        <span style={{ opacity: 0.5, fontSize: 10 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 340,
            maxHeight: 420,
            overflowY: 'auto',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            zIndex: 1000,
            padding: 6,
          }}
        >
          {/* Section Gemini */}
          {models.length > 0 && (
            <>
              <div style={{ fontSize: 10, opacity: 0.5, padding: '6px 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ◆ Gemini Cloud ({models.length})
              </div>
              {models.slice(0, 15).map(m => (
                <button
                  key={m.model_id}
                  onClick={() => select('gemini', m.model_id)}
                  disabled={saving}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    background: active.model_id === m.model_id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: 12,
                  }}
                  onMouseEnter={(e) => {
                    if (active.model_id !== m.model_id) e.currentTarget.style.background = 'var(--bg-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (active.model_id !== m.model_id) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{m.display_name}</div>
                  <div style={{ fontSize: 10, opacity: 0.5, fontFamily: 'var(--font-mono)' }}>{m.model_id}</div>
                </button>
              ))}
            </>
          )}

          {/* Section Ollama */}
          {ollama.length > 0 && (
            <>
              <div style={{ fontSize: 10, opacity: 0.5, padding: '6px 10px', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.05em', borderTop: '1px solid var(--border-subtle)' }}>
                ⬢ Ollama Local ({ollama.length})
              </div>
              {ollama.map(m => (
                <button
                  key={m.model_id}
                  onClick={() => select('ollama', m.model_id)}
                  disabled={saving}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 10px',
                    background: active.model_id === m.model_id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: 11,
                  }}
                  onMouseEnter={(e) => {
                    if (active.model_id !== m.model_id) e.currentTarget.style.background = 'var(--bg-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (active.model_id !== m.model_id) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {m.display_name}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}