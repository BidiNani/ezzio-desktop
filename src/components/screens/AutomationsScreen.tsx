import React from 'react';
import { EmptyState } from '../ui/EmptyState';
import { Zap } from 'lucide-react';

export const AutomationsScreen: React.FC = () => {
  return (
    <div style={{ padding: '24px 16px', maxWidth: 850, margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
          Automatisations
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Workflows autonomes et récurrences
        </p>
      </div>

      <EmptyState
        icon={Zap}
        title="Aucune automatisation active"
        description="Les workflows planifiés et déclencheurs d'événements s'afficheront dans cette vue."
      />
    </div>
  );
};
