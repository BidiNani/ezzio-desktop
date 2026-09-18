import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary — capture les erreurs de rendu des composants enfants.
 * Évite la "page blanche" silencieuse : on affiche l'erreur + un bouton
 * de rechargement, et on laisse le reste de l'app intacte si possible.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log console (utile en dev)
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    const err = this.state.error;
    const info = this.state.errorInfo;

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 24,
        background: 'var(--bg-primary, #0a0a0f)',
        color: 'var(--text-primary, #f0f0f5)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{
          maxWidth: 720, width: '100%', padding: 24,
          background: 'var(--bg-card, #1a1a22)',
          border: '1px solid var(--status-error, #ef4444)',
          borderRadius: 12,
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: 0.5, color: 'var(--status-error, #ef4444)',
            fontFamily: 'ui-monospace, monospace', marginBottom: 8,
          }}>
            Erreur d'affichage
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            Un composant a planté
          </h1>
          <p style={{
            fontSize: 13, color: 'var(--text-secondary, #b0b0b8)',
            lineHeight: 1.6, marginBottom: 16,
          }}>
            L'application a rencontré une erreur. Tu peux tenter de recharger
            la page. Si l'erreur persiste, ouvre la console (F12) pour voir les
            détails.
          </p>

          {err && (
            <pre style={{
              fontSize: 12, padding: 12, marginBottom: 12,
              background: 'var(--bg-secondary, #12121a)',
              borderRadius: 6, overflow: 'auto', maxHeight: 200,
              color: 'var(--status-error, #ef4444)',
              fontFamily: 'ui-monospace, monospace',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {err.name}: {err.message}
            </pre>
          )}

          {info && info.componentStack && (
            <details style={{ marginBottom: 16 }}>
              <summary style={{
                cursor: 'pointer', fontSize: 11,
                color: 'var(--text-muted, #7a7a85)',
                fontFamily: 'ui-monospace, monospace',
              }}>
                Stack du composant
              </summary>
              <pre style={{
                fontSize: 11, marginTop: 8, padding: 10,
                background: 'var(--bg-secondary, #12121a)',
                borderRadius: 4, overflow: 'auto', maxHeight: 220,
                color: 'var(--text-secondary, #b0b0b8)',
                fontFamily: 'ui-monospace, monospace',
                whiteSpace: 'pre-wrap',
              }}>
                {info.componentStack}
              </pre>
            </details>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={this.handleReload}
              style={{
                padding: '10px 16px', borderRadius: 6, fontSize: 13,
                fontWeight: 600, cursor: 'pointer', border: 'none',
                background: 'var(--accent-blue, #4a9eff)', color: '#fff',
              }}
            >
              Recharger la page
            </button>
            <button
              onClick={this.handleReset}
              style={{
                padding: '10px 16px', borderRadius: 6, fontSize: 13,
                fontWeight: 600, cursor: 'pointer',
                background: 'transparent',
                border: '1px solid var(--border-subtle, #2a2a35)',
                color: 'var(--text-secondary, #b0b0b8)',
              }}
            >
              Réessayer sans recharger
            </button>
          </div>
        </div>
      </div>
    );
  }
}