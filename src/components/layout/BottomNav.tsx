import React from 'react';
import { MessageCircle, ListChecks, ShieldCheck, Activity, Settings } from 'lucide-react';

interface BottomNavProps {
  active: string;
  onNavigate: (tab: string) => void;
  pendingApprovals: number;
}

const TABS = [
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'missions', label: 'Missions', icon: ListChecks },
  { id: 'approvals', label: 'Approbations', icon: ShieldCheck },
  { id: 'health', label: 'Sante', icon: Activity },
  { id: 'settings', label: 'Reglages', icon: Settings },
];

export const BottomNav: React.FC<BottomNavProps> = ({ active, onNavigate, pendingApprovals }) => (
  <nav
    style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '6px 0',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 100,
    }}
  >
    {TABS.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        onClick={() => onNavigate(id)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          color: active === id ? 'var(--accent-blue)' : 'var(--text-secondary)',
          fontSize: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
          padding: '4px 10px',
        }}
      >
        <Icon size={20} aria-hidden="true" />
        {label}
        {id === 'approvals' && pendingApprovals > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: 4,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--status-pending)',
            }}
          />
        )}
      </button>
    ))}
  </nav>
);
