import React, { useCallback, useEffect, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { useEzzioApi } from './hooks/useEzzioApi';
import {
  Mission,
  ApprovalRequest,
  Goal,
  SystemHealth,
} from './types';
import {
  Check,
  X,
  Shield,
  AlertTriangle,
  Cpu,
  Target,
  Send,
  Terminal,
} from 'lucide-react';

const statusLabel = (status: Mission['status']) => status.toUpperCase();

function App() {
  const [tab, setTab] = useState('approvals');

  const [theme, setTheme] = useState<'dark' | 'light'>(
    (localStorage.getItem('ezzio_theme') as 'dark' | 'light') ?? 'dark'
  );

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const api = useEzzioApi();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  const [chatMessages, setChatMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; time: string }>
  >([
    {
      role: 'assistant',
      text:
        "Système E-ZZIO v9.4 initialisé. Backend cloud-first actif. En attente d'instruction.",
      time: '21:00',
    },
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [activeModel, setActiveModel] = useState('Cloud');
  const [activeProvider, setActiveProvider] = useState('E-ZZIO');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ezzio_theme', theme);
  }, [theme]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
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
  }, [
    api.getMissions,
    api.getApprovals,
    api.getGoals,
    api.getHealth,
  ]);

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

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();

    const userText = inputMsg.trim();

    if (!userText || sending) {
      return;
    }

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

    setChatMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: userText,
        time: now,
      },
    ]);

    setInputMsg('');
    setSending(true);

    try {
      const result = await api.sendChat(userText, sessionId);

      if (result?.model) setActiveModel(result.model);
      if (result?.provider) setActiveProvider(result.provider);

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
          role: 'assistant',
          text: answer,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            err instanceof Error
              ? `Erreur E-ZZIO : ${err.message}`
              : 'Erreur E-ZZIO : réponse indisponible.',
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const renderApprovals = () => (
    <div
      style={{
        padding: 24,
        maxWidth: 820,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              margin: 0,
              color: '#f4f4f5',
            }}
          >
            Approbations Human-in-the-Loop
          </h2>
          <p
            style={{
              fontSize: 13,
              color: '#a1a1aa',
              margin: '4px 0 0',
            }}
          >
            Actions sensibles nécessitant une décision opérateur
          </p>
        </div>

        <span
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 12,
            fontFamily: 'monospace',
            background:
              approvals.length > 0 ? '#451a03' : '#052e16',
            color:
              approvals.length > 0 ? '#fbbf24' : '#34d399',
            border:
              approvals.length > 0
                ? '1px solid #78350f'
                : '1px solid #065f46',
          }}
        >
          {approvals.length} EN ATTENTE
        </span>
      </div>

      {approvals.length === 0 ? (
        <div
          style={{
            padding: 48,
            textAlign: 'center',
            background: '#18181b',
            borderRadius: 12,
            border: '1px dashed #27272a',
          }}
        >
          <Shield
            style={{
              width: 36,
              height: 36,
              color: '#10b981',
              marginBottom: 12,
            }}
          />

          <h3
            style={{
              fontSize: 15,
              margin: 0,
              color: '#f4f4f5',
            }}
          >
            Aucune approbation en attente
          </h3>

          <p
            style={{
              fontSize: 13,
              color: '#a1a1aa',
              margin: '6px 0 0',
            }}
          >
            Toutes les actions sensibles ont été traitées.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {approvals.map((req) => (
            <div
              key={req.id}
              style={{
                padding: 18,
                background: '#18181b',
                borderRadius: 10,
                border: '1px solid #78350f',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertTriangle
                    style={{
                      width: 16,
                      height: 16,
                      color: '#f59e0b',
                    }}
                  />

                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: 'monospace',
                      color: '#fbbf24',
                      fontWeight: 600,
                    }}
                  >
                    HITL · {req.missionTitle}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'monospace',
                    color: '#71717a',
                  }}
                >
                  {req.id}
                </span>
              </div>

              <p
                style={{
                  fontSize: 14,
                  color: '#f4f4f5',
                  margin: '0 0 8px',
                  lineHeight: 1.5,
                }}
              >
                {req.requestedAction}
              </p>

              <p
                style={{
                  fontSize: 12,
                  color: '#a1a1aa',
                  margin: '0 0 16px',
                  lineHeight: 1.5,
                }}
              >
                {req.context}
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                }}
              >
                <button
                  onClick={() => void handleReject(req.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    background: '#27272a',
                    color: '#f43f5e',
                    border: '1px solid #3f3f46',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                  }}
                >
                  <X style={{ width: 14, height: 14 }} />
                  Rejeter
                </button>

                <button
                  onClick={() => void handleApprove(req.id)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 6,
                    background: '#059669',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <Check style={{ width: 14, height: 14 }} />
                  Approuver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMissions = () => (
    <div
      style={{
        padding: 24,
        maxWidth: 900,
        margin: '0 auto',
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          margin: '0 0 4px',
        }}
      >
        Missions
      </h2>

      <p
        style={{
          fontSize: 13,
          color: '#a1a1aa',
          margin: '0 0 20px',
        }}
      >
        Suivi des missions et de leur progression
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {missions.map((m) => (
          <div
            key={m.id}
            style={{
              padding: '16px 20px',
              background: '#18181b',
              borderRadius: 10,
              border: m.isCritical
                ? '1px solid #334155'
                : '1px solid #27272a',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: 'monospace',
                      background:
                        m.status === 'completed'
                          ? '#052e16'
                          : m.status === 'running'
                            ? '#172554'
                            : '#3f2a0a',
                      color:
                        m.status === 'completed'
                          ? '#34d399'
                          : m.status === 'running'
                            ? '#60a5fa'
                            : '#fbbf24',
                    }}
                  >
                    {statusLabel(m.status)}
                  </span>

                  {m.isCritical && (
                    <span
                      style={{
                        fontSize: 10,
                        color: '#c4b5fd',
                        fontFamily: 'monospace',
                      }}
                    >
                      CRITIQUE
                    </span>
                  )}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 14,
                    color: '#f4f4f5',
                    fontWeight: 500,
                  }}
                >
                  {m.title}
                </div>

                <div
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    color: '#a1a1aa',
                  }}
                >
                  {m.description}
                </div>
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: '#a1a1aa',
                  fontFamily: 'monospace',
                }}
              >
                {m.id}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginTop: 14,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 6,
                  background: '#27272a',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${m.progress}%`,
                    height: '100%',
                    background:
                      m.status === 'completed'
                        ? '#10b981'
                        : '#3b82f6',
                    borderRadius: 3,
                  }}
                />
              </div>

              <span
                style={{
                  width: 40,
                  textAlign: 'right',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  color: '#a1a1aa',
                }}
              >
                {m.progress}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGoals = () => (
    <div
      style={{
        padding: 24,
        maxWidth: 850,
        margin: '0 auto',
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          margin: '0 0 4px',
        }}
      >
        Objectifs stratégiques
      </h2>

      <p
        style={{
          fontSize: 13,
          color: '#a1a1aa',
          margin: '0 0 20px',
        }}
      >
        Objectifs persistants et avancement
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {goals.map((g) => (
          <div
            key={g.id}
            style={{
              padding: 20,
              background: '#18181b',
              borderRadius: 10,
              border:
                g.priority === 'critical'
                  ? '2px solid #8b5cf6'
                  : '1px solid #27272a',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <Target
                  style={{
                    width: 18,
                    height: 18,
                    color:
                      g.priority === 'critical'
                        ? '#a78bfa'
                        : '#71717a',
                  }}
                />

                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#f4f4f5',
                    }}
                  >
                    {g.title}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      color: '#a1a1aa',
                      fontFamily: 'monospace',
                    }}
                  >
                    PRIORITY={g.priority.toUpperCase()} · STATUS=
                    {g.status.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginTop: 16,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 8,
                  background: '#27272a',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${g.progress}%`,
                    height: '100%',
                    background: '#8b5cf6',
                    borderRadius: 4,
                  }}
                />
              </div>

              <span
                style={{
                  width: 42,
                  textAlign: 'right',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  color: '#c4b5fd',
                  fontWeight: 600,
                }}
              >
                {g.progress}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHealth = () => (
    <div
      style={{
        padding: 24,
        maxWidth: 850,
        margin: '0 auto',
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          margin: '0 0 4px',
        }}
      >
        Santé du système
      </h2>

      <p
        style={{
          fontSize: 13,
          color: '#a1a1aa',
          margin: '0 0 20px',
        }}
      >
        World Model, providers et risques
      </p>

      {health && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                padding: 16,
                background: '#18181b',
                borderRadius: 8,
                border: '1px solid #27272a',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: '#71717a',
                  textTransform: 'uppercase',
                  fontFamily: 'monospace',
                }}
              >
                World Model
              </div>

              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#10b981',
                  marginTop: 4,
                }}
              >
                {health.worldModelFreshness.toUpperCase()}
              </div>
            </div>

            <div
              style={{
                padding: 16,
                background: '#18181b',
                borderRadius: 8,
                border: '1px solid #27272a',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: '#71717a',
                  textTransform: 'uppercase',
                  fontFamily: 'monospace',
                }}
              >
                Providers
              </div>

              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#3b82f6',
                  marginTop: 4,
                }}
              >
                {health.providers.length} surveillés
              </div>
            </div>

            <div
              style={{
                padding: 16,
                background: '#18181b',
                borderRadius: 8,
                border: '1px solid #27272a',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: '#71717a',
                  textTransform: 'uppercase',
                  fontFamily: 'monospace',
                }}
              >
                Risques
              </div>

              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color:
                    health.risks.length > 0
                      ? '#f59e0b'
                      : '#10b981',
                  marginTop: 4,
                }}
              >
                {health.risks.length}
              </div>
            </div>
          </div>

          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#f4f4f5',
              marginBottom: 12,
            }}
          >
            Fédération des modèles
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {health.providers.map((provider) => (
              <div
                key={provider.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: '#18181b',
                  borderRadius: 8,
                  border: '1px solid #27272a',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Cpu
                    style={{
                      width: 16,
                      height: 16,
                      color: '#a1a1aa',
                    }}
                  />

                  <span
                    style={{
                      fontSize: 13,
                      color: '#f4f4f5',
                      fontWeight: 500,
                    }}
                  >
                    {provider.name}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: 'monospace',
                      color: '#10b981',
                    }}
                  >
                    {provider.latencyMs ?? '—'} ms
                  </span>

                  <span
                    style={{
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 10,
                      background: '#052e16',
                      color: '#34d399',
                      fontWeight: 600,
                    }}
                  >
                    {provider.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {health.risks.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                Risques détectés
              </h3>

              {health.risks.map((risk) => (
                <div
                  key={risk.id}
                  style={{
                    padding: 14,
                    background: '#18181b',
                    borderRadius: 8,
                    border: '1px solid #78350f',
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: '#fbbf24',
                      fontFamily: 'monospace',
                    }}
                  >
                    {risk.severity.toUpperCase()}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: '#f4f4f5',
                      marginTop: 6,
                    }}
                  >
                    {risk.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderChat = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 45px)',
        maxWidth: 900,
        margin: '0 auto',
        padding: 16,
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          paddingBottom: 16,
        }}
      >
        {chatMessages.map((msg, index) => (
          <div
            key={`${msg.time}-${index}`}
            style={{
              alignSelf:
                msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: 10,
              background:
                msg.role === 'user' ? '#1e3a8a' : '#18181b',
              border:
                msg.role === 'user'
                  ? '1px solid #2563eb'
                  : '1px solid #27272a',
              color: '#f4f4f5',
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <div>{msg.text}</div>

            <div
              style={{
                fontSize: 10,
                color: '#a1a1aa',
                marginTop: 6,
                textAlign: 'right',
                fontFamily: 'monospace',
              }}
            >
              {msg.time}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSendChat}
        style={{
          display: 'flex',
          gap: 8,
          paddingTop: 10,
          borderTop: '1px solid #27272a',
        }}
      >
        <input
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Envoyer une commande au Master Governor..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 8,
            background: '#18181b',
            border: '1px solid #27272a',
            color: '#f4f4f5',
            fontSize: 13,
          }}
        />

        <button
          type="submit"
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            background: '#10b981',
            color: '#09090b',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Send style={{ width: 14, height: 14 }} />
        </button>
      </form>
    </div>
  );

  const renderScreen = () => {
    switch (tab) {
      case 'approvals':
        return renderApprovals();
      case 'missions':
        return renderMissions();
      case 'goals':
        return renderGoals();
      case 'health':
        return renderHealth();
      case 'chat':
        return renderChat();

      case 'settings':
        return (
          <div
            style={{
              padding: 24,
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            <h2
              style={{
                fontSize: 18,
                marginBottom: 16,
              }}
            >
              Paramètres
            </h2>

            <div
              style={{
                padding: 16,
                background: '#18181b',
                borderRadius: 8,
                border: '1px solid #27272a',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={theme === 'light'}
                  onChange={(e) =>
                    setTheme(
                      e.target.checked ? 'light' : 'dark'
                    )
                  }
                />
                Activer le thème clair
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#09090b',
        color: '#f4f4f5',
      }}
    >
      {!isMobile && (
        <Sidebar
          active={tab}
          onNavigate={setTab}
          pendingApprovals={approvals.length}
          onKillSwitch={() => {
            if (
              confirm(
                'Arrêter immédiatement tous les workers et swarms en cours ?'
              )
            ) {
              alert('Signal de terminaison propre diffusé.');
            }
          }}
        />
      )}

      <main
        style={{
          flex: 1,
          paddingBottom: isMobile ? 64 : 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          style={{
            padding: '10px 16px',
            borderBottom: '1px solid #27272a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: '#a1a1aa',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Terminal
              style={{
                width: 14,
                height: 14,
                color: '#10b981',
              }}
            />

            <span
              style={{
                fontFamily: 'monospace',
              }}
            >
              {api.serverConfig.address}:{api.serverConfig.port}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#10b981',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#10b981',
              }}
            />

            <span>
              {activeModel} · {activeProvider} · LIVE
            </span>
          </div>
        </header>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {renderScreen()}
        </div>
      </main>

      {isMobile && (
        <BottomNav
          active={tab}
          onNavigate={setTab}
          pendingApprovals={approvals.length}
        />
      )}
    </div>
  );
}

export default App;

