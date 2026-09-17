import React from 'react';
import { ChatMessage } from '../../types';
import { Cpu, User, Bot, AlertCircle } from 'lucide-react';

interface MessageItemProps {
  message: ChatMessage;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        width: 'fit-content',
        gap: 4,
      }}
    >
      {/* Header Info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          color: 'var(--text-muted)',
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          padding: '0 4px',
        }}
      >
        {isUser ? (
          <>
            <span>Vous</span>
            <User size={12} />
          </>
        ) : (
          <>
            <Bot size={12} color="var(--accent-blue)" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              E-ZZIO Governor
            </span>
            {message.model && message.provider && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  padding: '1px 6px',
                  borderRadius: 4,
                  background: 'color-mix(in srgb, var(--accent-purple) 15%, transparent)',
                  color: 'var(--accent-purple)',
                  border: '1px solid color-mix(in srgb, var(--accent-purple) 30%, transparent)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Cpu size={10} />
                {message.model} ({message.provider})
              </span>
            )}
          </>
        )}
      </div>

      {/* Bubble Content */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
          background: isError
            ? 'color-mix(in srgb, var(--status-error) 12%, var(--bg-card))'
            : isUser
              ? 'color-mix(in srgb, var(--accent-blue) 20%, var(--bg-card))'
              : 'var(--bg-card)',
          border: isError
            ? '1px solid var(--status-error)'
            : isUser
              ? '1px solid color-mix(in srgb, var(--accent-blue) 40%, transparent)'
              : '1px solid var(--border-subtle)',
          color: 'var(--text-primary)',
          fontSize: 14,
          lineHeight: 1.5,
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {isError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--status-error)',
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            <AlertCircle size={14} />
            Erreur d'exécution
          </div>
        )}
        {message.text}
      </div>

      {/* Timestamp */}
      <div
        style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          padding: '0 4px',
        }}
      >
        {message.time}
      </div>
    </div>
  );
};
