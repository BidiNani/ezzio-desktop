import { useState, useEffect } from 'react';

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  key_configured: boolean;
  enabled: boolean;
  url: string;
}

const API = 'http://127.0.0.1:8001';

export function ToolSelector() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/api/tools`)
      .then(r => r.json())
      .then(d => setTools(d.tools || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-sm opacity-70">Chargement des outils…</div>;
  if (error)   return <div className="p-4 text-sm text-red-500">Erreur : {error}</div>;

  return (
    <div className="tool-selector p-4 space-y-2">
      <div className="text-xs uppercase tracking-wider opacity-60 mb-2">Outils de recherche</div>
      {tools.map(t => (
        <div
          key={t.id}
          className="flex items-center justify-between px-3 py-2 rounded bg-white/5 border border-white/10"
        >
          <div>
            <div className="font-medium text-sm">{t.name}</div>
            <div className="text-xs opacity-60">{t.description}</div>
          </div>
          <div className="text-xs">
            {t.enabled ? (
              <span className="text-green-400">● actif</span>
            ) : t.key_configured ? (
              <span className="text-yellow-400">● inactif</span>
            ) : (
              <span className="text-red-400">● clé manquante</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}