import { useState, useEffect } from 'react';

const THEMES: { id: string; label: string; preview: string[] }[] = [
  { id: 'dark',       label: 'Dark (défaut)', preview: ['#0a0a0f', '#1a1a22', '#f0f0f5'] },
  { id: 'light',      label: 'Light',         preview: ['#ffffff', '#f5f5f7', '#0a0a0f'] },
  { id: 'midnight',   label: 'Midnight',      preview: ['#0a0e1a', '#1a2138', '#e8edf7'] },
  { id: 'nord',       label: 'Nord',          preview: ['#2e3440', '#434c5e', '#eceff4'] },
  { id: 'solarized',  label: 'Solarized',     preview: ['#002b36', '#0e4654', '#eee8d5'] },
];

const DENSITIES: { id: string; label: string; hint: string }[] = [
  { id: 'compact', label: 'Compact', hint: '0.75×' },
  { id: 'normal',  label: 'Normal',  hint: '1.0×' },
  { id: 'comfy',   label: 'Confort', hint: '1.25×' },
];

const LS_THEME = 'ezzio-theme';
const LS_DENSITY = 'ezzio-density';

export function SettingsScreen() {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem(LS_THEME) ?? 'dark');
  const [density, setDensity] = useState<string>(() => localStorage.getItem(LS_DENSITY) ?? 'normal');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(LS_THEME, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
    localStorage.setItem(LS_DENSITY, density);
  }, [density]);

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
        Réglages
      </h2>

      {/* Thèmes */}
      <section style={{ marginBottom: 32 }}>
        <h3 style={{
          fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: 0.5, color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)', marginBottom: 12,
        }}>
          Thème
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 12,
        }}>
          {THEMES.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  padding: 12, borderRadius: 8, cursor: 'pointer',
                  background: 'var(--bg-card)',
                  border: '2px solid ' + (active ? 'var(--accent-blue)' : 'var(--border-subtle)'),
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                  {t.preview.map((c, i) => (
                    <div key={i} style={{
                      width: 24, height: 24, borderRadius: 4,
                      background: c, border: '1px solid rgba(255,255,255,0.1)',
                    }} />
                  ))}
                </div>
                <div style={{
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? 'var(--accent-blue)' : 'var(--text-primary)',
                }}>
                  {t.label}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Densités */}
      <section style={{ marginBottom: 32 }}>
        <h3 style={{
          fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: 0.5, color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)', marginBottom: 12,
        }}>
          Densité d'affichage
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {DENSITIES.map((d) => {
            const active = density === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDensity(d.id)}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
                  background: active ? 'color-mix(in srgb, var(--accent-blue) 15%, transparent)' : 'var(--bg-card)',
                  border: '1px solid ' + (active ? 'var(--accent-blue)' : 'var(--border-subtle)'),
                  color: active ? 'var(--accent-blue)' : 'var(--text-primary)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                <div style={{ fontSize: 13 }}>{d.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{d.hint}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Info */}
      <section style={{
        padding: 14, background: 'var(--bg-card)', borderRadius: 8,
        border: '1px solid var(--border-subtle)', fontSize: 12,
        color: 'var(--text-secondary)', lineHeight: 1.6,
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
          Préférences sauvegardées
        </div>
        Thème et densité sont conservés dans le navigateur (localStorage) et appliqués au démarrage.
      </section>
    </div>
  );
}