import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:8001';
interface FileItem { name: string; path: string; is_dir: boolean; size: number; modified: string; }

export function FilesScreen() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<{ path: string; content: string } | null>(null);

  const load = async (path: string = '') => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/files?path=${encodeURIComponent(path)}`);
      const d = await r.json();
      setItems(d.data || []);
      setCurrentPath(d.path || '');
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openFile = async (path: string) => {
    try {
      const r = await fetch(`${API}/api/files/content?path=${encodeURIComponent(path)}`);
      const d = await r.json();
      if (d.ok) setContent({ path, content: d.content });
    } catch (e) { console.error(e); }
  };

  const goUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    load(parts.join('/'));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Fichiers</h2>
          <span style={{ fontSize: 12, opacity: 0.5, fontFamily: 'var(--font-mono)' }}>{currentPath || '.'}</span>
        </div>
        {currentPath && (
          <button onClick={goUp} className="btn-secondary" style={{ marginBottom: 12 }}>↑ Parent</button>
        )}
        {loading && <div style={{ opacity: 0.6 }}>Chargement…</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {items.map(item => (
            <button key={item.path}
              onClick={() => item.is_dir ? load(item.path) : openFile(item.path)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 4, cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)', fontSize: 13
              }}>
              <span>{item.is_dir ? '📁' : '📄'} {item.name}</span>
              <span style={{ fontSize: 11, opacity: 0.5 }}>{item.is_dir ? '' : formatSize(item.size)}</span>
            </button>
          ))}
        </div>
      </div>
      {content && (
        <div style={{ width: '45%', padding: 24, borderLeft: '1px solid var(--border-subtle)', overflow: 'auto', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{content.path}</span>
            <button onClick={() => setContent(null)} className="btn-secondary">×</button>
          </div>
          <pre style={{ fontSize: 11, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-primary)' }}>
            {content.content}
          </pre>
        </div>
      )}
    </div>
  );
}