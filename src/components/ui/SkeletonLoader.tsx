import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'card' | 'text' | 'circle';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width = '100%',
  height = 16,
  count = 1,
}) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        aria-hidden="true"
        style={{
          width: variant === 'circle' ? height : width,
          height: variant === 'circle' ? height : variant === 'text' ? 16 : height,
          borderRadius: variant === 'circle' ? '50%' : 'var(--radius-sm)',
          background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%)',
          backgroundSize: '200% 100%',
          animation: 'skeleton-sweep 1.5s ease-in-out infinite',
          marginBottom: variant !== 'circle' && count > 1 ? 8 : 0,
        }}
      />
    ))}
  </>
);
