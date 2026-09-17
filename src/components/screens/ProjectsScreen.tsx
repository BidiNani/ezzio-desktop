import React from 'react';
import { EmptyState } from '../ui/EmptyState';
import { FolderKanban } from 'lucide-react';

export const ProjectsScreen: React.FC = () => {
  return (
    <div style={{ padding: '24px 16px', maxWidth: 850, margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
          Projets
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Gestionnaire de projets souverain E-ZZIO
        </p>
      </div>

      <EmptyState
        icon={FolderKanban}
        title="Module Projets non connecté"
        description="Aucune API de gestion de projets n'est actuellement exposée par le Master Governor."
      />
    </div>
  );
};
