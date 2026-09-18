import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePolling } from '../hooks/usePolling';

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('tick immédiat au mount', () => {
    const cb = vi.fn();
    renderHook(() => usePolling(cb, 1000, true));
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('ne tick PAS si enabled=false', () => {
    const cb = vi.fn();
    renderHook(() => usePolling(cb, 1000, false));
    vi.advanceTimersByTime(5000);
    expect(cb).not.toHaveBeenCalled();
  });

  it('tick à intervalle régulier', () => {
    const cb = vi.fn();
    renderHook(() => usePolling(cb, 1000, true));
    expect(cb).toHaveBeenCalledTimes(1); // initial
    vi.advanceTimersByTime(1000);
    expect(cb).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(2000);
    expect(cb).toHaveBeenCalledTimes(4);
  });

  it('nettoie l\'interval au unmount', () => {
    const cb = vi.fn();
    const { unmount } = renderHook(() => usePolling(cb, 1000, true));
    vi.advanceTimersByTime(1000);
    const callsBefore = cb.mock.calls.length;
    unmount();
    vi.advanceTimersByTime(5000);
    expect(cb.mock.calls.length).toBe(callsBefore);
  });
});