import React, { useState, useEffect } from 'react';
import { MemoryItem } from '../../types';
import { Database, Search, RefreshCw, Loader2, Clock, User, Bot, AlertCircle } from 'lucide-react';

interface MemoryScreenProps {
  onGetRecent: (limit?: number) => Promise<MemoryItem[]>;
  onSearch: (query: string, limit?: number) => Promise<MemoryItem[]>;
  connected: boolean;
}

export const MemoryScreen: React.FC<MemoryScreenProps> = ({ onGetRecent, onSearch, connected }) => {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'recent' | 'search'>('recent');

  const loadRecent = async () => {
    if (!connected) return;
    setLoading(true);
    setError(null);
    const result = await onGetRecent(20);
    setItems(result);
    setLoading(false);
    if (result.length === 0) {
      setError('Aucun item récent dans la mémoire. Le World Model peut être vide ou l\'API /memory/recent est indisponible.');
    }
  };

  useEffect(() => {
    if (connected) void loadRecent();
  }, [connected]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !connected) return;
    setLoading(true);
    setError(null);
    setMode('search');
    const result = await onSearch(searchQuery.trim(), 10);
    setItems(result);
    setLoading(false);
  };

  const handleRefresh = () => {
    setMode('recent');
    setSearchQuery('');
    void loadRecent();
  };

  const getItemText = (item: MemoryItem): string =>
    item.content ?? item.text ?? JSON.stringify(item);

  const getItemRole = (item: MemoryItem): 'user' | 'assistant' | 'system' => {
    const r = item.role?.toLowerCase();
    if (r === 'user') return 'user';
    if (r === 'assistant') return 'assistant';
    return 'system';
  };

  return (
    <div style={{ padding: '24px 16px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Database size={20} color="var(--accent-blue)" />
          Mémoire Long-terme
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          World Model · SQLite WAL/FTS5 · Session Context — Source: /memory/recent, /memory/search
        </p>
      </div>

      {/* Search & Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <form onSubmit={(e) => void handleSearch(e)} style={{ display: 'flex', gap: 8, flex: 1 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans la mémoire..."
            disabled={!connected || loading}
            className="input-field"
            style={{ flex: 1, minWidth: 180 }}
          />
          <button
            type="submit"
            disabled={!searchQuery.trim() || !connected || loading}
            className="btn-primary"
            style={{ padding: '8px 14px' }}
          >
            <Search size={15} />
          </button>
        </form>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading || !connected}
          className="btn-secondary"
        >
          <RefreshCw size={14} />
          Récents
        </button>
      </div>

      {/* Mode Badge */}
      <div style={{ marginBottom: 12, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        {mode === 'recent' ? '20 entrées récentes — World Model' : `Résultats pour "${searchQuery}"`}
        {loading && <Loader2 size={12} style={{ marginLeft: 8, display: 'inline', animation: 'spin 1s linear infinite' }} />}
      </div>

      {/* Error */}
      {error && !loading && (
        <div style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'color-mix(in srgb, var(--status-pending) 12%, transparent)', border: '1px solid var(--status-pending)', color: 'var(--status-pending)', fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          {error}
        </div>
      )}

      {/* Items list */}
      {!loading && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item, i) => {
            const role = getItemRole(item);
            return (
              <div
                key={item.id ?? i}
                style={{
                  padding: '12px 16px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {role === 'user' ? (
                    <User size={14} color="var(--accent-blue)" />
                  ) : role === 'assistant' ? (
                    <Bot size={14} color="var(--accent-purple)" />
                  ) : (
                    <Database size={14} color="var(--text-muted)" />
                  )}
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: role === 'user' ? 'var(--accent-blue)' : role === 'assistant' ? 'var(--accent-purple)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {role}
                  </span>
                  {item.timestamp && (
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} />
                      {item.timestamp}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {getItemText(item)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && items.length === 0 && !error && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          <Database size={40} strokeWidth={1} style={{ marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
          Aucune entrée mémoire disponible pour le moment.
        </div>
      )}
    </div>
  );
};
