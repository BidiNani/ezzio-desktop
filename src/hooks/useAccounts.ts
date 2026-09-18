import { useCallback, useEffect, useState } from 'react';
import type { AccountProvider, ConnectedAccount } from '../types/accounts';

const API_BASE = 'http://127.0.0.1:8001';

interface State {
  providers: AccountProvider[];
  accounts: ConnectedAccount[];
  loading: boolean;
  error: string | null;
}

export function useAccounts() {
  const [state, setState] = useState<State>({
    providers: [], accounts: [], loading: true, error: null,
  });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const r = await fetch(`${API_BASE}/api/accounts/providers`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const providers: AccountProvider[] = data.providers ?? [];
      const accounts: ConnectedAccount[] = providers
        .filter((p) => p.connected && p.account)
        .map((p) => p.account as ConnectedAccount);
      setState({ providers, accounts, loading: false, error: null });
    } catch (e) {
      setState((s) => ({
        ...s, loading: false,
        error: e instanceof Error ? e.message : 'Erreur inconnue',
      }));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 60000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const connect = useCallback(async (providerId: string): Promise<void> => {
    try {
      const r = await fetch(`${API_BASE}/api/accounts/connect/${providerId}`, {
        method: 'POST',
      });
      const data = await r.json();
      if (!r.ok || !data.ok) {
        const msg =
          data?.detail?.message ?? data?.message ??
          data?.detail?.error ?? data?.error ?? 'Connexion impossible';
        alert(msg);
        return;
      }
      const w = 520, h = 640;
      const left = window.screenX + (window.innerWidth - w) / 2;
      const top = window.screenY + (window.innerHeight - h) / 2;
      const popup = window.open(
        data.url, `oauth-${providerId}`,
        `width=${w},height=${h},left=${left},top=${top}`,
      );
      const check = window.setInterval(() => {
        if (!popup || popup.closed) {
          window.clearInterval(check);
          void refresh();
        }
      }, 800);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur réseau');
    }
  }, [refresh]);

  const disconnect = useCallback(async (providerId: string): Promise<void> => {
    try {
      const r = await fetch(`${API_BASE}/api/accounts/${providerId}`, {
        method: 'DELETE',
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur réseau');
    }
  }, [refresh]);

  return {
    providers: state.providers,
    accounts: state.accounts,
    loading: state.loading,
    error: state.error,
    refresh, connect, disconnect,
  };
}