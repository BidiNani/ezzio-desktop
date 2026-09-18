import { useState, useEffect, useCallback } from 'react';
import { AppShell } from './components/layout/AppShell';
import { ChatScreen } from './components/chat/ChatScreen';
import { MissionsScreen } from './components/screens/MissionsScreen';
import { ApprovalsScreen } from './components/screens/ApprovalsScreen';
import { ObjectivesScreen } from './components/screens/ObjectivesScreen';
import { ProjectsScreen } from './components/screens/ProjectsScreen';
import { FilesScreen } from './components/screens/FilesScreen';
import { SearchScreen } from './components/screens/SearchScreen';
import { AutomationsScreen } from './components/screens/AutomationsScreen';
import { MemoryScreen } from './components/screens/MemoryScreen';
import { AccountsScreen } from './components/screens/AccountsScreen';
import { HealthScreen } from './components/screens/HealthScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { KillSwitchScreen } from './components/screens/KillSwitchScreen';
import { useEzzioApi } from './hooks/useEzzioApi';
import { usePolling } from './hooks/usePolling';
import { TabId, SystemHealth } from './types';

// ---------------------------------------------------------------------------
// Détection mobile simple (pas de dépendance externe)
// ---------------------------------------------------------------------------
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// ---------------------------------------------------------------------------
// Mapping TabId -> écran. Les onglets sans composant dédié sont mappés sur un
// écran proche (goals -> ObjectivesScreen, research -> SearchScreen).
// ---------------------------------------------------------------------------
type ScreenComponent = () => React.ReactElement;

// Tous les écrans SAUF "settings", qui a un rendu dédié (props spécifiques).
type StandardTab = Exclude<TabId, 'settings'>;

const SCREEN_MAP: Record<StandardTab, ScreenComponent> = {
  chat:        () => <ChatScreen />,
  missions:    () => <MissionsScreen />,
  approvals:   () => <ApprovalsScreen />,
  goals:       () => <ObjectivesScreen />,
  projects:    () => <ProjectsScreen />,
  files:       () => <FilesScreen />,
  research:    () => <SearchScreen />,
  automations: () => <AutomationsScreen />,
  memory:      () => <MemoryScreen />,
  accounts:    () => <AccountsScreen />,
  health:      () => <HealthScreen />,
};

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  const api = useEzzioApi();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [activeTab, setActiveTab] = useState<TabId>('chat');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem('ezzio_theme');
    return stored === 'light' ? 'light' : 'dark';
  });
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [showKillSwitch, setShowKillSwitch] = useState(false);

  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  // Applique le thème au document + persistance
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ezzio_theme', theme);
  }, [theme]);

  // Polling santé (toutes les 15s)
  const tickHealth = useCallback(async () => {
    const h = await api.getHealth();
    setHealth(h);
  }, [api]);

  usePolling(tickHealth, 30000, true);

  // Polling approbations en attente (toutes les 15s)
  const tickApprovals = useCallback(async () => {
    const approvals = await api.getApprovals();
    setPendingApprovals(approvals.length);
  }, [api]);

  usePolling(tickApprovals, 30000, true);

  // Handlers réseau
  const handleUpdateAddress = useCallback(
    (address: string) => api.setServerAddress(address),
    [api]
  );
  const handleUpdatePort = useCallback(
    (port: number) => api.setServerPort(port),
    [api]
  );

  const handleToggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  // Rendu de l'écran actif
  const renderScreen = (): React.ReactElement => {
    if (activeTab === 'settings') {
      return (
        <SettingsScreen />
      );
    }
    const Screen = SCREEN_MAP[activeTab as StandardTab];
    return Screen();
  };

  return (
    <>
      <AppShell
        activeTab={activeTab}
        onNavigate={setActiveTab}
        pendingApprovals={pendingApprovals}
        serverConfig={api.serverConfig}
        activeModel="auto"
        activeProvider="auto"
        health={health}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        showContextPanel={showContextPanel}
        onToggleContextPanel={() => setShowContextPanel((v) => !v)}
        onKillSwitch={() => setShowKillSwitch(true)}
        isMobile={isMobile}
      >
        {renderScreen()}
      </AppShell>

      {showKillSwitch && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => setShowKillSwitch(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              maxWidth: 700,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => setShowKillSwitch(false)}
              aria-label="Fermer"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: 20,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
            <KillSwitchScreen />
          </div>
        </div>
      )}
    </>
  );
}