import React from 'react';
import { ContextPanel } from '../context/ContextPanel';
import { SystemHealth, ServerConfig } from '../../types';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  activeModel: string;
  activeProvider: string;
  health: SystemHealth | null;
  serverConfig: ServerConfig;
  showContextPanel: boolean;
  onCloseContextPanel: () => void;
  isMobile: boolean;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  children,
  activeModel,
  activeProvider,
  health,
  serverConfig,
  showContextPanel,
  onCloseContextPanel,
  isMobile,
}) => {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
        height: 'calc(100vh - 50px)',
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {children}
      </div>

      <ContextPanel
        activeModel={activeModel}
        activeProvider={activeProvider}
        health={health}
        serverConfig={serverConfig}
        isOpen={showContextPanel}
        onClose={onCloseContextPanel}
        isMobile={isMobile}
      />
    </div>
  );
};
