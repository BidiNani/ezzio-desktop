import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      textAlign: 'center',
      minHeight: 200,
    }}
  >
    <Icon size={40} strokeWidth={1.5} color="var(--text-muted)" style={{ marginBottom: 16 }} aria-hidden="true" />
    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
    <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 320, marginBottom: action ? 16 : 0 }}>
      {description}
    </p>
    {action && (
      <button className="btn-primary" onClick={action.onClick}>
        {action.label}
      </button>
    )}
  </div>
);
