import { useState, useRef } from 'react';
import { ModelSelector } from '../ui/ModelSelector';
import { MessageList } from './MessageList';
import { ChatComposer } from './ChatComposer';
import { ChatMessage } from '../../types';

interface ChatScreenProps {
  _onSendMessage?: (message: string) => Promise<void>;
  initialMessages?: ChatMessage[];
}

export function ChatScreen({ _onSendMessage, initialMessages }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages || [
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Système E-ZZIO Workspace initialisé. En attente d\'instruction.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const sessionIdRef = useRef<string>(
    `desktop-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );

  const API_BASE = 'http://127.0.0.1:8001';

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/master/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          speed: 'auto',
          force_cloud: true,
          mission_profile: 'STANDARD',
          model_target: 'auto',
          channel: 'desktop',
          session_id: sessionIdRef.current,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply =
        data.response || data.answer || data.content || data.message ||
        '(réponse vide)';

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
        model: data.model,
        provider: data.provider,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Erreur : ${err instanceof Error ? err.message : 'inconnue'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--bg-primary)',
      }}
    >
      {/* Header avec sélecteur de modèle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)',
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            Conversation
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {messages.length} message{messages.length > 1 ? 's' : ''}
          </div>
        </div>

        <ModelSelector />
      </div>

      {/* Liste des messages */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <MessageList messages={messages} sending={loading} />
      </div>

      {/* Zone de saisie */}
      <ChatComposer onSend={handleSend} disabled={loading} />
    </div>
  );
}