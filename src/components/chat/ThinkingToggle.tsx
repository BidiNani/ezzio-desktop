import { useState, useEffect } from 'react';

interface Props {
  currentModel: string;
}

interface ThinkingSupport {
  supported: boolean;
  method: string | null;
  levels: string[];
}

export function ThinkingToggle({ currentModel }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [level, setLevel] = useState('low');
  const [support, setSupport] = useState<ThinkingSupport>({
    supported: false, method: null, levels: []
  });
  const [loading, setLoading] = useState(false);

  // Vérifier le support quand le modèle change
  useEffect(() => {
    if (!currentModel) return;
    fetch(`http://127.0.0.1:8001/api/models/thinking-support?model=${encodeURIComponent(currentModel)}`)
      .then(r => r.json())
      .then((d: ThinkingSupport) => {
        setSupport(d);
        if (!d.supported) setEnabled(false);
      })
      .catch(() => setSupport({ supported: false, method: null, levels: [] }));
  }, [currentModel]);

  // Charger le state actuel
  useEffect(() => {
    fetch('http://127.0.0.1:8001/api/settings/thinking')
      .then(r => r.json())
      .then(d => {
        setEnabled(d.thinking_enabled ?? false);
        if (d.thinking_level && d.thinking_level !== 'off') {
          setLevel(d.thinking_level);
        }
      })
      .catch(() => {});
  }, []);

  const update = async (newEnabled: boolean, newLevel: string) => {
    setLoading(true);
    try {
      await fetch('http://127.0.0.1:8001/api/settings/thinking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newEnabled, level: newLevel }),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!support.supported) {
    return (
      <div
        className="thinking-toggle disabled"
        title={`Modèle ${currentModel} ne supporte pas le thinking`}
        style={{
          padding: '6px 12px',
          borderRadius: 6,
          background: 'var(--bg-secondary, #2a2a2a)',
          color: 'var(--text-muted, #888)',
          fontSize: 13,
          cursor: 'not-allowed',
          opacity: 0.6,
        }}
      >
        🧠 Thinking non disponible
      </div>
    );
  }

  const selectableLevels = support.levels.filter(l => l !== 'off');

  return (
    <div
      className="thinking-toggle"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: 6,
        background: enabled ? 'rgba(100, 150, 255, 0.15)' : 'var(--bg-secondary, #2a2a2a)',
        fontSize: 13,
      }}
    >
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={enabled}
          disabled={loading}
          onChange={(e) => {
            const v = e.target.checked;
            setEnabled(v);
            update(v, v ? level : 'off');
          }}
        />
        🧠 Thinking
      </label>
      {enabled && selectableLevels.length > 1 && (
        <select
          value={level}
          disabled={loading}
          onChange={(e) => {
            setLevel(e.target.value);
            update(true, e.target.value);
          }}
          style={{
            background: 'var(--bg-primary, #1a1a1a)',
            color: 'var(--text-primary, #fff)',
            border: '1px solid var(--border-subtle, #333)',
            borderRadius: 4,
            padding: '2px 6px',
            fontSize: 12,
          }}
        >
          {selectableLevels.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      )}
    </div>
  );
}