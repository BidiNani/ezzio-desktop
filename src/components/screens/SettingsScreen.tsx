import React, { useState, useEffect } from 'react';
import { ServerConfig } from '../../types';
import { Server, Sun, Moon, Check, RefreshCw, Shield, QrCode, Cpu, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';

interface SettingsScreenProps {
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
  serverConfig: ServerConfig;
  onUpdateAddress: (address: string) => void;
  onUpdatePort: (port: number) => void;
  onPing: () => Promise<{ status: string } | null>;
  getGovernanceSettings?: () => Promise<{
    ok: boolean;
    settings: {
      local_only: boolean;
      cloud_fallback: boolean;
      max_budget_cents: number;
      profiles: Record<string, string>;
    };
    registered_models_count: number;
    available_local_roles: string[];
  } | null>;
  updateGovernanceSettings?: (payload: {
    local_only?: boolean;
    cloud_fallback?: boolean;
    max_budget_cents?: number;
  }) => Promise<{ ok: boolean; settings: any } | null>;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  theme,
  onThemeChange,
  serverConfig,
  onUpdateAddress,
  onUpdatePort,
  onPing,
  getGovernanceSettings,
  updateGovernanceSettings,
}) => {
  const [address, setAddress] = useState(serverConfig.address);
  const [port, setPort] = useState(String(serverConfig.port));
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  // Governance state
  const [govSettings, setGovSettings] = useState<{
    local_only: boolean;
    cloud_fallback: boolean;
    max_budget_cents: number;
    profiles: Record<string, string>;
  }>({
    local_only: false,
    cloud_fallback: true,
    max_budget_cents: 1000,
    profiles: {
      chat: 'LOCAL_PREFERRED',
      coding: 'CODER_FEDERATION',
      reasoning: 'GEMINI_CLOUD',
    },
  });
  const [localRoles, setLocalRoles] = useState<string[]>([]);
  const [govLoading, setGovLoading] = useState(false);
  const [govSavedMessage, setGovSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (getGovernanceSettings) {
      void getGovernanceSettings().then((res) => {
        if (res && res.ok && res.settings) {
          setGovSettings(res.settings);
          setLocalRoles(res.available_local_roles || []);
        }
      });
    }
  }, [getGovernanceSettings]);

  const handleSaveNetwork = () => {
    onUpdateAddress(address);
    onUpdatePort(Number(port) || 8001);
  };

  const handleTestPing = async () => {
    setPinging(true);
    setPingResult(null);
    const res = await onPing();
    setPinging(false);
    if (res) {
      setPingResult('Connexion réussie au backend E-ZZIO (ONLINE)');
    } else {
      setPingResult('Échec de connexion au backend.');
    }
  };

  const handleToggleLocalOnly = async () => {
    const nextVal = !govSettings.local_only;
    setGovSettings((prev) => ({ ...prev, local_only: nextVal }));
    if (updateGovernanceSettings) {
      setGovLoading(true);
      await updateGovernanceSettings({ local_only: nextVal });
      setGovLoading(false);
      setGovSavedMessage('Mode LOCAL ONLY mis à jour avec succès.');
      setTimeout(() => setGovSavedMessage(null), 3000);
    }
  };

  const handleToggleCloudFallback = async () => {
    const nextVal = !govSettings.cloud_fallback;
    setGovSettings((prev) => ({ ...prev, cloud_fallback: nextVal }));
    if (updateGovernanceSettings) {
      setGovLoading(true);
      await updateGovernanceSettings({ cloud_fallback: nextVal });
      setGovLoading(false);
      setGovSavedMessage('Fallback Cloud mis à jour.');
      setTimeout(() => setGovSavedMessage(null), 3000);
    }
  };

  const handleBudgetChange = async (cents: number) => {
    setGovSettings((prev) => ({ ...prev, max_budget_cents: cents }));
    if (updateGovernanceSettings) {
      await updateGovernanceSettings({ max_budget_cents: cents });
      setGovSavedMessage('Plafond budgétaire mis à jour.');
      setTimeout(() => setGovSavedMessage(null), 3000);
    }
  };

  return (
    <div style={{ padding: '24px 16px', maxWidth: 740, margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
          Réglages du Workspace & Gouvernance
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Configuration de l'interface, souveraineté des modèles, budgets et connectivité réseau
        </p>
      </div>

      {/* Governance & Sovereignty Card */}
      <div
        style={{
          padding: 20,
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Shield size={18} color="var(--accent-blue)" />
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Gouvernance Cognitive & Souveraineté Locale
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* LOCAL_ONLY Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                Souveraineté Stricte (LOCAL_ONLY)
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Interdit tout appel API externe (Gemini, Groq, NVIDIA) et force l'exécution sur Ollama local.
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleToggleLocalOnly()}
              disabled={govLoading}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: govSettings.local_only ? 'var(--status-running)' : 'var(--text-muted)' }}
            >
              {govSettings.local_only ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>

          {/* Cloud Fallback Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                Basculement Cloud de Secours (Fallback)
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Autorise le basculement vers Gemini Cloud si le modèle local Ollama est saturé ou indisponible.
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleToggleCloudFallback()}
              disabled={govSettings.local_only || govLoading}
              style={{
                background: 'none',
                border: 'none',
                cursor: govSettings.local_only ? 'not-allowed' : 'pointer',
                color: govSettings.cloud_fallback && !govSettings.local_only ? 'var(--accent-blue)' : 'var(--text-muted)',
              }}
            >
              {govSettings.cloud_fallback && !govSettings.local_only ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>

          {/* Budget Limit */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <DollarSign size={16} color="var(--accent-blue)" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Plafond Budgétaire Cloud Mensuel
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Bloque automatiquement les appels payants au-delà du seuil fixé.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                value={govSettings.max_budget_cents / 100}
                onChange={(e) => void handleBudgetChange(Math.round(Number(e.target.value) * 100))}
                className="input-field"
                style={{ width: 80, textAlign: 'right' }}
                min={0}
                step={5}
              />
              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>€</span>
            </div>
          </div>

          {/* Active Routing Matrix */}
          <div style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Cpu size={15} color="var(--accent-blue)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Matrice des Rôles & Modèles Actifs
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
              <div style={{ fontSize: 12, padding: 8, background: 'var(--bg-card)', borderRadius: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Chat Général :</span> <strong>Ollama Local / Fast</strong>
              </div>
              <div style={{ fontSize: 12, padding: 8, background: 'var(--bg-card)', borderRadius: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Coding / Coder :</span> <strong>Ollama ➔ NVIDIA ➔ Gemini</strong>
              </div>
              <div style={{ fontSize: 12, padding: 8, background: 'var(--bg-card)', borderRadius: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Stratégie / Raisonnement :</span> <strong>Gemini Flash 3.8</strong>
              </div>
            </div>
          </div>

          {govSavedMessage && (
            <div style={{ fontSize: 12, color: 'var(--status-running)', fontWeight: 500 }}>
              ✓ {govSavedMessage}
            </div>
          )}
        </div>
      </div>

      {/* Theme Selection */}
      <div
        style={{
          padding: 20,
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
          Apparence & Thème
        </h3>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => onThemeChange('dark')}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 'var(--radius-sm)',
              background: theme === 'dark' ? 'var(--accent-blue)' : 'var(--bg-card-hover)',
              color: theme === 'dark' ? '#fff' : 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <Moon size={16} />
            Thème Sombre
          </button>

          <button
            type="button"
            onClick={() => onThemeChange('light')}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 'var(--radius-sm)',
              background: theme === 'light' ? 'var(--accent-blue)' : 'var(--bg-card-hover)',
              color: theme === 'light' ? '#fff' : 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <Sun size={16} />
            Thème Clair
          </button>
        </div>
      </div>

      {/* Backend Connection & Pairing Settings */}
      <div
        style={{
          padding: 20,
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Server size={18} color="var(--accent-blue)" />
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Connexion Réseau & Appairage (Local / Tailscale)
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              Adresse Hôte (IP locale ou IP Tailscale)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field"
              placeholder="127.0.0.1 ou 100.x.y.z"
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              Port HTTP
            </label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="input-field"
              placeholder="8001"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={handleSaveNetwork} className="btn-primary">
            <Check size={14} />
            Enregistrer
          </button>

          <button
            type="button"
            onClick={() => void handleTestPing()}
            disabled={pinging}
            className="btn-secondary"
          >
            <RefreshCw size={14} />
            {pinging ? 'Test en cours...' : 'Tester connexion'}
          </button>
        </div>

        {pingResult && (
          <div
            style={{
              marginTop: 14,
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: pingResult.includes('réussie') ? 'var(--status-running)' : 'var(--status-error)',
            }}
          >
            {pingResult}
          </div>
        )}

        {/* Pairing info for Mobile */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <QrCode size={15} color="var(--accent-blue)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Appairage Client Mobile (Capacitor Android)
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 8px' }}>
            Pour connecter l'application Android APK via Tailscale ou Wi-Fi local, renseignez l'adresse IP de votre machine hôte (ex: <code>100.x.y.z</code> ou <code>192.168.x.y</code>) dans le champ ci-dessus.
          </p>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', padding: '6px 10px', background: 'var(--bg-secondary)', borderRadius: 4, color: 'var(--text-muted)' }}>
            URL cible : http://{address}:{port}
          </div>
        </div>
      </div>
    </div>
  );
};

