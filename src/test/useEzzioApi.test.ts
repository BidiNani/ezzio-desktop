import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEzzioApi } from '../hooks/useEzzioApi';

describe('useEzzioApi — stabilité', () => {
  it('retourne le MÊME objet entre 2 renders (anti-boucle)', () => {
    const { result, rerender } = renderHook(() => useEzzioApi());
    const first = result.current;
    rerender();
    const second = result.current;
    expect(second).toBe(first); // même référence
  });
});