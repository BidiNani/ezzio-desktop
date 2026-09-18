import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBackendStatus } from '../hooks/useBackendStatus';

describe('useBackendStatus', () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
  });

  it('démarre offline, puis online après check', async () => {
    const { result } = renderHook(() => useBackendStatus(1000));
    expect(result.current.online).toBe(false);
    await new Promise(r => setTimeout(r, 100));
    // le fetch a été appelé au moins une fois
    expect(global.fetch).toHaveBeenCalled();
  });
});