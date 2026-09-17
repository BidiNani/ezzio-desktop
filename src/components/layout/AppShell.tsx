import React from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { WorkspaceLayout } from './WorkspaceLayout';
import { TabId, SystemHealth, ServerConfig } from '../../types';

interface AppShellProps {
  children: React.ReactNode;
  activeTab: TabId;
  onNavigate: (tab: TabId) => void;
  pendingApprovals: number;
  serverConfig: ServerConfig;
  activeModel: string;
  activeProvider: string;
  health: SystemHealth | null;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  showContextPanel: boolean;
  onToggleContextPanel: () => void;
  onKillSwitch: () => void;
  isMobile: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeTab,
  onNavigate,
  pendingApprovals,
  serverConfig,
  activeModel,
  activeProvider,
  health,
  theme,
  onToggleTheme,
  showContextPanel,
  onToggleContextPanel,
  onKillSwitch,
  isMobile,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
      }}
    >
      {!isMobile && (
        <Sidebar
          active={activeTab}
          onNavigate={onNavigate}
          pendingApprovals={pendingApprovals}
          onKillSwitch={onKillSwitch}
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingBottom: isMobile ? 56 : 0 }}>
        <TopBar
          serverConfig={serverConfig}
          activeModel={activeModel}
          activeProvider={activeProvider}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onToggleContextPanel={onToggleContextPanel}
          isMobile={isMobile}
        />

        <WorkspaceLayout
          activeModel={activeModel}
          activeProvider={activeProvider}
          health={health}
          serverConfig={serverConfig}
          showContextPanel={showContextPanel}
          onCloseContextPanel={onToggleContextPanel}
          isMobile={isMobile}
        >
          {children}
        </WorkspaceLayout>
      </div>

      {isMobile && (
        <BottomNav
          active={activeTab}
          onNavigate={onNavigate}
          pendingApprovals={pendingApprovals}
        />
      )}
    </div>
  );
};
