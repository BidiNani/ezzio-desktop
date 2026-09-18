/**
 * Toast — système de notifications légères.
 * Usage :
 *   const { show } = useToast();
 *   show.success('Fichier sauvegardé');
 *   show.error('Erreur réseau');
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type ToastKind = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
  duration: number;
}

interface ToastAPI {
  success: (m: string, d?: number) => void;
  error: (m: string, d?: number) => void;
  info: (m: string, d?: number) => void;
  warning: (m: string, d?: number) => void;
}

const ToastContext = createContext<ToastAPI | null>(null);

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans <ToastProvider>');
  return ctx;
}

const COLORS: Record<ToastKind, { border: string; icon: string }> = {
  success: { border: 'var(--status-running)', icon: '✓' },
  error:   { border: 'var(--status-error)',   icon: '✕' },
  warning: { border: 'var(--status-warning)', icon: '⚠' },
  info:    { border: 'var(--accent-blue)',    icon: 'ℹ' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string, duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message, duration }]);
  }, []);

  const api: ToastAPI = {
    success: (m, d) => push('success', m, d),
    error:   (m, d) => push('error', m, d),
    info:    (m, d) => push('info', m, d),
    warning: (m, d) => push('warning', m, d),
  };

  const remove = (id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div style={{
        position: 'fixed', bottom: 20, right: 20,
        display: 'flex', flexDirection: 'column', gap: 8,
        zIndex: 9999, pointerEvents: 'none',
      }}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDone={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  const [exiting, setExiting] = useState(false);
  const { border, icon } = COLORS[toast.kind];

  useEffect(() => {
    const timer = window.setTimeout(() => setExiting(true), toast.duration);
    const done = window.setTimeout(onDone, toast.duration + 300);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(done);
    };
  }, [toast.duration, onDone]);

  return (
    <div style={{
      pointerEvents: 'auto',
      minWidth: 260, maxWidth: 380, padding: '12px 16px',
      background: 'var(--bg-card)',
      border: `1px solid ${border}`,
      borderLeft: `3px solid ${border}`,
      borderRadius: 8,
      boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
      color: 'var(--text-primary)', fontSize: 13,
      display: 'flex', alignItems: 'center', gap: 10,
      opacity: exiting ? 0 : 1,
      transform: exiting ? 'translateX(20px)' : 'translateX(0)',
      transition: 'opacity 0.3s, transform 0.3s',
      animation: 'ezzio-toast-in 0.25s ease-out',
    }}>
      <span style={{
        width: 20, height: 20, borderRadius: '50%',
        background: border, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}>{icon}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
    </div>
  );
}