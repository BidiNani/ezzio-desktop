import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBackendStatus } from '../hooks/useBackendStatus';

describe('useBackendStatus', () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
  });

  it('démarre offline, puis online après check', async () => {
    const { result } = renderHook(() => useBackendStatus(1000));
    expect(result.current.online).toBe(false);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(result.current.online).toBe(true);
    });
  });
});