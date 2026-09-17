import React from 'react';
import { EmptyState } from '../ui/EmptyState';
import { FileText } from 'lucide-react';

export const FilesScreen: React.FC = () => {
  return (
    <div style={{ padding: '24px 16px', maxWidth: 850, margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
          Fichiers & Artefacts
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Traçabilité cryptographique et artefacts scellés
        </p>
      </div>

      <EmptyState
        icon={FileText}
        title="Aucun artefact scellé sélectionné"
        description="Les artefacts scellés générés par les tâches s'afficheront ici lors des exécutions."
      />
    </div>
  );
};
