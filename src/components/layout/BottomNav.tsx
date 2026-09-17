import React from 'react';
import { MessageSquare, ListChecks, ShieldCheck, Activity, Settings, LucideIcon } from 'lucide-react';
import { TabId } from '../../types';

interface BottomNavProps {
  active: TabId;
  onNavigate: (tab: TabId) => void;
  pendingApprovals: number;
}

interface BottomTabItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

const TABS: BottomTabItem[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'missions', label: 'Missions', icon: ListChecks },
  { id: 'approvals', label: 'Approbations', icon: ShieldCheck },
  { id: 'health', label: 'Santé', icon: Activity },
  { id: 'settings', label: 'Réglages', icon: Settings },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  active,
  onNavigate,
  pendingApprovals,
}) => (
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
      padding: '4px 0',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4px)',
      zIndex: 100,
      height: 56,
    }}
  >
    {TABS.map(({ id, label, icon: Icon }) => {
      const isActive = active === id;
      return (
        <button
          key={id}
          type="button"
          onClick={() => onNavigate(id)}
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
            fontSize: 11,
            fontWeight: isActive ? 600 : 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            cursor: 'pointer',
            flex: 1,
            minHeight: 44,
          }}
        >
          <Icon size={20} aria-hidden="true" color={isActive ? 'var(--accent-blue)' : undefined} />
          <span>{label}</span>
          {id === 'approvals' && pendingApprovals > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 'calc(50% - 14px)',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--status-pending)',
              }}
            />
          )}
        </button>
      );
    })}
  </nav>
);
