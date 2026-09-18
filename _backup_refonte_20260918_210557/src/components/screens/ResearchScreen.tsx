import React, { useState } from 'react';
import { ResearchResult } from '../../types';
import { Compass, Search, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

interface ResearchScreenProps {
  onSearch: (query: string, mode: 'fast' | 'deep' | 'local') => Promise<ResearchResult | null>;
  connected: boolean;
}

export const ResearchScreen: React.FC<ResearchScreenProps> = ({ onSearch, connected }) => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'fast' | 'deep' | 'local'>('fast');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q || loading || !connected) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const res = await onSearch(q, mode);

    setLoading(false);

    if (res) {
      setResult(res);
    } else {
      setError('Aucun résultat retourné par le backend. Vérifier les providers Research.');
    }
  };

  // Extract the useful text content from the result data object (varies by provider)
  const extractContent = (data: Record<string, unknown>): string => {
    const candidates = [
      data.content,
      data.answer,
      data.summary,
      data.text,
      data.result,
      data.results,
      data.response,
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && c.length > 0) return c;
      if (Array.isArray(c) && c.length > 0) {
        return c
          .map((item) =>
            typeof item === 'string'
              ? item
              : typeof item === 'object' && item !== null
                ? (item as Record<string, unknown>).title ?? (item as Record<string, unknown>).snippet ?? JSON.stringify(item)
                : ''
          )
          .filter(Boolean)
          .join('\n\n');
      }
    }
    return JSON.stringify(data, null, 2);
  };

  const extractSources = (data: Record<string, unknown>): Array<{ url: string; title: string }> => {
    const sources = data.sources ?? data.results ?? data.items ?? [];
    if (!Array.isArray(sources)) return [];
    return sources
      .filter((s): s is Record<string, unknown> => typeof s === 'object' && s !== null)
      .map((s) => ({
        url: String(s.url ?? s.link ?? ''),
        title: String(s.title ?? s.name ?? s.url ?? ''),
      }))
      .filter((s) => s.url.length > 0)
      .slice(0, 8);
  };

  return (
    <div style={{ padding: '24px 16px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Compass size={20} color="var(--accent-blue)" />
          Recherche Souveraine
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Tavily · SearxNG · Jina · Gemini · Ollama — via DecisionRouter E-ZZIO
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={(e) => void handleSearch(e)} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Entrez votre requête de recherche..."
            disabled={!connected || loading}
            className="input-field"
            style={{ flex: 1, minWidth: 200 }}
          />

          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'fast' | 'deep' | 'local')}
            disabled={!connected || loading}
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: 13,
              cursor: 'pointer',
              minHeight: 42,
            }}
          >
            <option value="fast">Fast (Tavily/Searx)</option>
            <option value="deep">Deep (Research)</option>
            <option value="local">Local (Ollama)</option>
          </select>

          <button
            type="submit"
            disabled={!query.trim() || !connected || loading}
            className="btn-primary"
          >
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={16} />}
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>

        {!connected && (
          <p style={{ fontSize: 12, color: 'var(--status-error)', marginTop: 8 }}>
            Backend hors ligne — connexion requise pour effectuer une recherche.
          </p>
        )}
      </form>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: 14,
            borderRadius: 'var(--radius-md)',
            background: 'color-mix(in srgb, var(--status-error) 12%, transparent)',
            border: '1px solid var(--status-error)',
            color: 'var(--status-error)',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16,
          }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginBottom: 16,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 4, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--accent-blue)' }}>
              MODE={result.mode.toUpperCase()}
            </span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 4, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--accent-purple)' }}>
              PROVIDER={result.provider.toUpperCase()}
            </span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 4, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              TASK={result.taskId}
            </span>
          </div>

          {/* Main content */}
          <div
            style={{
              padding: 20,
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: 14,
              lineHeight: 1.7,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              marginBottom: 16,
            }}
          >
            {extractContent(result.data)}
          </div>

          {/* Sources */}
          {extractSources(result.data).length > 0 && (
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
                Sources
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {extractSources(result.data).map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--accent-blue)',
                      fontSize: 13,
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={12} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {src.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
