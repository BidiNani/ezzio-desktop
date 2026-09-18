/**
 * Skeleton — placeholder animé pendant le chargement.
 */
import React from 'react';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 4, style }: SkeletonProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--bg-secondary) 0%, var(--bg-card-hover) 50%, var(--bg-secondary) 100%)',
        backgroundSize: '200% 100%',
        animation: 'ezzio-skeleton 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonList({ rows = 4, rowHeight = 44 }: { rows?: number; rowHeight?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={rowHeight} borderRadius={6} />
      ))}
    </div>
  );
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div style={{
      padding: 16, background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)', borderRadius: 8,
    }}>
      <Skeleton width="40%" height={18} style={{ marginBottom: 12 }} />
      <SkeletonList rows={rows} rowHeight={14} />
    </div>
  );
}