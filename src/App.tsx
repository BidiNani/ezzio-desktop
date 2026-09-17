import React, { useCallback, useEffect, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { useEzzioApi } from './hooks/useEzzioApi';
import {
  TabId,
  Mission,
  ApprovalRequest,
  Goal,
  SystemHealth,
  ChatMessage,
} from './types';
import { ChatScreen } from './components/chat/ChatScreen';
import { MissionsScreen } from './components/missions/MissionsScreen';
import { ApprovalsScreen } from './components/screens/ApprovalsScreen';
import { ProjectsScreen } from './components/screens/ProjectsScreen';
import { FilesScreen } from './components/screens/FilesScreen';
import { ResearchScreen } from './components/screens/ResearchScreen';
import { AutomationsScreen } from './components/screens/AutomationsScreen';
import { MemoryScreen } from './components/screens/MemoryScreen';
import { HealthScreen } from './components/screens/HealthScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { Target } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('chat');

  const [theme, setTheme] = useState<'dark' | 'light'>(
    (localStorage.getItem('ezzio_theme') as 'dark' | 'light') ?? 'dark'
  );

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showContextPanel, setShowContextPanel] = useState(false);

  const api = useEzzioApi();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg-1',
      role: 'assistant',
      text: 'Système E-ZZIO Workspace initialisé. En attente d\'instruction.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [sending, setSending] = useState(false);
  const [activeModel, setActiveModel] = useState('Auto');
  const [activeProvider, setActiveProvider] = useState('E-ZZIO');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ezzio_theme', theme);
  }, [theme]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const refreshData = useCallback(async () => {
    const [m, a, g, h] = await Promise.all([
      api.getMissions(),
      api.getApprovals(),
      api.getGoals(),
      api.getHealth(),
    ]);

    if (m) setMissions(m);
    if (a) setApprovals(a);
    if (g) setGoals(g);
    if (h) setHealth(h);
  }, [api]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const handleApprove = async (id: string) => {
    const result = await api.approveMission(id);
    if (result?.success) {
      setApprovals((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleReject = async (id: string) => {
    const result = await api.rejectMission(id);
    if (result?.success) {
      setApprovals((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSendChat = async (userText: string) => {
    if (!userText.trim() || sending) return;

    const sessionStorageKey = 'ezzio_desktop_session_id';
    let sessionId = localStorage.getItem(sessionStorageKey);

    if (!sessionId) {
      sessionId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `desktop-${Date.now()}`;
      localStorage.setItem(sessionStorageKey, sessionId);
    }

    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsgId = `user-${Date.now()}`;
    setChatMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        text: userText,
        time: now,
      },
    ]);

    setSending(true);

    try {
      const result = await api.sendChat(userText, sessionId);

      const returnedModel = result?.model ?? 'Auto';
      const returnedProvider = result?.provider ?? 'E-ZZIO';

      setActiveModel(returnedModel);
      setActiveProvider(returnedProvider);

      const answer =
        result?.response ??
        result?.answer ??
        result?.content ??
        result?.message;

      if (!answer) {
        throw new Error('Réponse vide du backend E-ZZIO.');
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          text: answer,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          model: returnedModel,
          provider: returnedProvider,
          status: 'success',
        },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text:
            err instanceof Error
              ? `Erreur E-ZZIO : ${err.message}`
              : 'Erreur E-ZZIO : réponse indisponible.',
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: 'error',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const renderGoals = () => (
    <div style={{ padding: '24px 16px', maxWidth: 850, margin: '0 auto', width: '100%' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
        Objectifs Stratégiques
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
        Objectifs persistants et état d'avancement
      </p>

      {goals.length === 0 ? (
        <div
          style={{
            padding: 48,
            textAlign: 'center',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)',
          }}
        >
          <Target style={{ width: 40, height: 40, color: 'var(--text-muted)', marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, margin: 0, color: 'var(--text-primary)' }}>
            Aucun objectif défini
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            Aucun objectif stratégique n'est actuellement suivi par le Master.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {goals.map((g) => (
            <div
              key={g.id}
              style={{
                padding: 20,
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: g.priority === 'critical' ? '2px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Target size={18} color={g.priority === 'critical' ? 'var(--accent-purple)' : 'var(--text-muted)'} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{g.title}</div>
                    <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      PRIORITY={g.priority.toUpperCase()} · STATUS={g.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                <div style={{ flex: 1, height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${g.progress}%`, height: '100%', background: 'var(--accent-purple)', borderRadius: 4 }} />
                </div>
                <span style={{ width: 42, textAlign: 'right', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)', fontWeight: 600 }}>
                  {g.progress}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <ChatScreen
            messages={chatMessages}
            sending={sending}
            onSendMessage={handleSendChat}
            connected={api.serverConfig.connected}
          />
        );
      case 'missions':
        return <MissionsScreen missions={missions} />;
      case 'approvals':
        return (
          <ApprovalsScreen
            approvals={approvals}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        );
      case 'goals':
        return renderGoals();
      case 'projects':
        return <ProjectsScreen />;
      case 'files':
        return <FilesScreen />;
      case 'research':
        return (
          <ResearchScreen
            onSearch={api.searchResearch}
            connected={api.serverConfig.connected}
          />
        );
      case 'automations':
        return <AutomationsScreen />;
      case 'memory':
        return (
          <MemoryScreen
            onGetRecent={api.getMemoryRecent}
            onSearch={api.searchMemory}
            connected={api.serverConfig.connected}
          />
        );
      case 'health':
        return (
          <HealthScreen
            health={health}
            connected={api.serverConfig.connected}
            onRefresh={refreshData}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            theme={theme}
            onThemeChange={setTheme}
            serverConfig={api.serverConfig}
            onUpdateAddress={api.setServerAddress}
            onUpdatePort={api.setServerPort}
            onPing={api.ping}
            getGovernanceSettings={api.getGovernanceSettings}
            updateGovernanceSettings={api.updateGovernanceSettings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AppShell
      activeTab={activeTab}
      onNavigate={setActiveTab}
      pendingApprovals={approvals.length}
      serverConfig={api.serverConfig}
      activeModel={activeModel}
      activeProvider={activeProvider}
      health={health}
      theme={theme}
      onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      showContextPanel={showContextPanel}
      onToggleContextPanel={() => setShowContextPanel((prev) => !prev)}
      onKillSwitch={() => {
        if (confirm('Arrêter immédiatement tous les workers et swarms en cours ?')) {
          alert('Signal de terminaison propre diffusé.');
        }
      }}
      isMobile={isMobile}
    >
      {renderActiveScreen()}
    </AppShell>
  );
}

export default App;
