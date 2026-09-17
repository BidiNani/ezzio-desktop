import React from 'react';
import { Mission } from '../../types';
import { MissionCard } from '../ui/MissionCard';
import { ListChecks } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

interface MissionsScreenProps {
  missions: Mission[];
  onRefresh?: () => void;
}

export const MissionsScreen: React.FC<MissionsScreenProps> = ({ missions }) => {
  return (
    <div style={{ padding: '24px 16px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
          Missions
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Suivi des missions et de leur progression d'exécution
        </p>
      </div>

      {missions.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Aucune mission active"
          description="Aucune mission n'est actuellement enregistrée sur le Master Governor."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {missions.map((m) => (
            <MissionCard key={m.id} mission={m} />
          ))}
        </div>
      )}
    </div>
  );
};
