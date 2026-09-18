import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../../types';
import { MessageItem } from './MessageItem';
import { MessageSquare } from 'lucide-react';
import { SkeletonLoader } from '../ui/SkeletonLoader';

interface MessageListProps {
  messages: ChatMessage[];
  sending: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, sending }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  if (messages.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          textAlign: 'center',
          padding: 32,
        }}
      >
        <MessageSquare size={48} strokeWidth={1} style={{ marginBottom: 12 }} />
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
          Workspace E-ZZIO Chat
        </h3>
        <p style={{ fontSize: 13, maxWidth: 360 }}>
          Posez une question ou envoyez une instruction au Master Governor.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '16px 20px',
      }}
    >
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}

      {sending && (
        <div style={{ alignSelf: 'flex-start', width: 200, marginTop: 4 }}>
          <SkeletonLoader variant="card" height={40} />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
