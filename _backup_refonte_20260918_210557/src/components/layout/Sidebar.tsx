import React from 'react';
import {
  MessageSquare,
  ListChecks,
  ShieldCheck,
  Target,
  FolderKanban,
  FileText,
  Compass,
  Zap,
  Database,
  Activity,
  Settings,
  Square,
  Link2,
  LucideIcon,
} from 'lucide-react';
import { TabId } from '../../types';

interface SidebarProps {
  active: TabId;
  onNavigate: (tab: TabId) => void;
  pendingApprovals: number;
  onKillSwitch: () => void;
}

interface NavItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'missions', label: 'Missions', icon: ListChecks },
  { id: 'approvals', label: 'Approbations', icon: ShieldCheck },
  { id: 'goals', label: 'Objectifs', icon: Target },
  { id: 'projects', label: 'Projets', icon: FolderKanban },
  { id: 'files', label: 'Fichiers', icon: FileText },
  { id: 'research', label: 'Recherche', icon: Compass },
  { id: 'automations', label: 'Automatisations', icon: Zap },
  { id: 'memory', label: 'Mémoire', icon: Database },
  { id: 'accounts', label: 'Comptes', icon: Link2 },
  { id: 'health', label: 'Santé', icon: Activity },
  { id: 'settings', label: 'Réglages', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  active,
  onNavigate,
  pendingApprovals,
  onKillSwitch,
}) => (
  <nav
    style={{
      width: 220,
      flexShrink: 0,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 12px',
      gap: 4,
      overflowY: 'auto',
    }}
  >
    <div
      style={{
        fontWeight: 800,
        fontSize: 16,
        padding: '0 8px 12px',
        marginBottom: 4,
        borderBottom: '1px solid var(--border-subtle)',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span>E-ZZIO Workspace</span>
      <span
        style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          padding: '2px 6px',
          borderRadius: 4,
          background: 'var(--bg-card)',
          color: 'var(--accent-blue)',
        }}
      >
        v9.4
      </span>
    </div>

    {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
      const isActive = active === id;
      return (
        <button
          key={id}
          type="button"
          onClick={() => onNavigate(id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: isActive ? 'var(--bg-card)' : 'transparent',
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: 13,
            fontWeight: isActive ? 600 : 400,
            transition: 'background 0.15s ease',
          }}
        >
          <Icon size={16} aria-hidden="true" color={isActive ? 'var(--accent-blue)' : undefined} />
          <span>{label}</span>
          {id === 'approvals' && pendingApprovals > 0 && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 11,
                fontWeight: 600,
                background: 'color-mix(in srgb, var(--status-pending) 20%, transparent)',
                color: 'var(--status-pending)',
                padding: '1px 6px',
                borderRadius: 8,
              }}
            >
              {pendingApprovals}
            </span>
          )}
        </button>
      );
    })}

    <button
      type="button"
      onClick={onKillSwitch}
      style={{
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid color-mix(in srgb, var(--status-error) 30%, transparent)',
        background: 'color-mix(in srgb, var(--status-error) 10%, transparent)',
        color: 'var(--status-error)',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <Square size={16} aria-hidden="true" />
      Kill switch
    </button>
  </nav>
);