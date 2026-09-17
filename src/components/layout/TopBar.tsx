import React from 'react';
import { SystemStatus } from '../ui/SystemStatus';
import { PanelRight, Search, Sun, Moon } from 'lucide-react';
import { ServerConfig } from '../../types';

interface TopBarProps {
  serverConfig: ServerConfig;
  activeModel: string;
  activeProvider: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onToggleContextPanel: () => void;
  isMobile: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  serverConfig,
  activeModel,
  activeProvider,
  theme,
  onToggleTheme,
  onToggleContextPanel,
  isMobile,
}) => {
  return (
    <header
      style={{
        height: 50,
        padding: '0 16px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          E-ZZIO
        </span>

        {!isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-card)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              width: 220,
            }}
          >
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Recherche dans l'espace..."
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: 12,
                width: '100%',
                outline: 'none',
              }}
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <SystemStatus
          connected={serverConfig.connected}
          model={activeModel}
          provider={activeProvider}
          compact={isMobile}
        />

        <button
          type="button"
          onClick={onToggleTheme}
          title="Changer de thème"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          type="button"
          onClick={onToggleContextPanel}
          title="Afficher le panneau de contexte"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <PanelRight size={16} />
        </button>
      </div>
    </header>
  );
};
