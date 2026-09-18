import { useState } from 'react';
import { useAccounts } from '../../hooks/useAccounts';
import type { AccountProvider } from '../../types/accounts';

const CATEGORY_LABELS: Record<string, string> = {
  chat: 'Communication',
  social: 'Réseaux sociaux',
  dev: 'Développement',
  productivity: 'Productivité',
};

const CATEGORY_ORDER = ['chat', 'social', 'productivity', 'dev'];

function StatusBadge({ provider }: { provider: AccountProvider }) {
  const base = {
    fontSize: 11, fontWeight: 600,
    padding: '2px 8px', borderRadius: 8,
  } as const;
  if (provider.connected) {
    return (
      <span style={{ ...base, color: 'var(--status-running)',
        background: 'color-mix(in srgb, var(--status-running) 15%, transparent)' }}>
        Connecté
      </span>
    );
  }
  if (provider.configured) {
    return (
      <span style={{ ...base, color: 'var(--accent-blue)',
        background: 'color-mix(in srgb, var(--accent-blue) 15%, transparent)' }}>
        Prêt
      </span>
    );
  }
  return (
    <span style={{ ...base, color: 'var(--text-muted)',
      background: 'var(--bg-secondary)' }}>
      Non configuré
    </span>
  );
}

function ProviderCard({
  provider, onConnect, onDisconnect,
}: {
  provider: AccountProvider;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
}) {
  const acc = provider.account;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 10,
      padding: 16, background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)', borderRadius: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: provider.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 16,
          }}>
            {provider.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {provider.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {CATEGORY_LABELS[provider.category] ?? provider.category}
            </div>
          </div>
        </div>
        <StatusBadge provider={provider} />
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        {provider.description}
      </div>

      {acc && (
        <div style={{ fontSize: 12, color: 'var(--text-primary)',
          padding: 8, background: 'var(--bg-secondary)', borderRadius: 6 }}>
          {acc.display_name || acc.email || acc.account_id || 'Compte connecté'}
          {acc.email && acc.display_name && (
            <span style={{ color: 'var(--text-muted)' }}> ({acc.email})</span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        {!provider.connected && (
          <button
            type="button"
            onClick={() => onConnect(provider.id)}
            disabled={!provider.configured}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 6,
              fontSize: 13, fontWeight: 600, cursor: provider.configured ? 'pointer' : 'not-allowed',
              background: provider.configured ? 'var(--accent-blue)' : 'var(--bg-secondary)',
              color: provider.configured ? '#fff' : 'var(--text-muted)',
              border: 'none',
            }}
          >
            Connecter
          </button>
        )}
        {provider.connected && (
          <button
            type="button"
            onClick={() => onDisconnect(provider.id)}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 6,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: 'transparent', color: 'var(--status-error)',
              border: '1px solid var(--status-error)',
            }}
          >
            Déconnecter
          </button>
        )}
        <a
          href={provider.doc_url}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '8px 12px', borderRadius: 6, fontSize: 13,
            color: 'var(--text-secondary)', textDecoration: 'none',
            border: '1px solid var(--border-subtle)',
          }}
        >
          Docs
        </a>
      </div>
    </div>
  );
}

export function AccountsScreen() {
  const { providers, loading, error, refresh, connect, disconnect } = useAccounts();
  const [filter, setFilter] = useState<string>('all');

  const stats = {
    total: providers.length,
    connected: providers.filter((p) => p.connected).length,
    configured: providers.filter((p) => p.configured && !p.connected).length,
    available: providers.filter((p) => !p.configured).length,
  };

  const filtered = filter === 'all'
    ? providers
    : providers.filter((p) => p.category === filter);

  const grouped = CATEGORY_ORDER
    .map((cat) => ({
      cat,
      list: filtered.filter((p) => p.category === cat),
    }))
    .filter((g) => g.list.length > 0);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
          Comptes & Intégrations
        </h2>
        <button
          onClick={() => void refresh()}
          disabled={loading}
          style={{
            padding: '6px 12px', borderRadius: 6, fontSize: 12,
            background: 'transparent', color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)', cursor: 'pointer',
          }}
        >
          {loading ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        Connecte tes comptes externes pour qu'E-zzio puisse interagir avec eux.
      </p>

      {/* Bandeau stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12, marginBottom: 20,
      }}>
        <div style={{ padding: 14, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Total</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{stats.total}</div>
        </div>
        <div style={{ padding: 14, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid color-mix(in srgb, var(--status-running) 30%, transparent)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Connectés</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--status-running)' }}>{stats.connected}</div>
        </div>
        <div style={{ padding: 14, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid color-mix(in srgb, var(--accent-blue) 30%, transparent)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Prêts</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-blue)' }}>{stats.configured}</div>
        </div>
        <div style={{ padding: 14, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Disponibles</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-muted)' }}>{stats.available}</div>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
            border: '1px solid ' + (filter === 'all' ? 'var(--accent-blue)' : 'var(--border-subtle)'),
            background: filter === 'all' ? 'color-mix(in srgb, var(--accent-blue) 15%, transparent)' : 'transparent',
            color: filter === 'all' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            fontWeight: filter === 'all' ? 600 : 400,
          }}
        >
          Tous ({stats.total})
        </button>
        {CATEGORY_ORDER.map((cat) => {
          const count = providers.filter((p) => p.category === cat).length;
          if (count === 0) return null;
          const active = filter === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                border: '1px solid ' + (active ? 'var(--accent-blue)' : 'var(--border-subtle)'),
                background: active ? 'color-mix(in srgb, var(--accent-blue) 15%, transparent)' : 'transparent',
                color: active ? 'var(--accent-blue)' : 'var(--text-secondary)',
                fontWeight: active ? 600 : 400,
              }}
            >
              {CATEGORY_LABELS[cat] ?? cat} ({count})
            </button>
          );
        })}
      </div>

      {error && (
        <div style={{
          padding: 12, marginBottom: 16, borderRadius: 8,
          background: 'color-mix(in srgb, var(--status-error) 15%, transparent)',
          color: 'var(--status-error)', fontSize: 13,
        }}>
          Impossible de joindre le backend : {error}
        </div>
      )}

      {grouped.map(({ cat, list }) => (
        <div key={cat} style={{ marginBottom: 24 }}>
          <h3 style={{
            fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: 0.5, color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', marginBottom: 12,
          }}>
            {CATEGORY_LABELS[cat] ?? cat}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 12,
          }}>
            {list.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                onConnect={connect}
                onDisconnect={disconnect}
              />
            ))}
          </div>
        </div>
      ))}

      {!loading && providers.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>
          Aucun provider disponible
        </div>
      )}
    </div>
  );
}