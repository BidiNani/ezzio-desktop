import { ChatMessage } from '../../types';

interface MessageItemProps {
  message: ChatMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        padding: '6px 20px',
      }}
    >
      <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 4,
            fontSize: 11,
            color: 'var(--text-muted)',
          }}
        >
          <span style={{ fontWeight: 600, color: isUser ? 'var(--text-primary)' : 'var(--accent-blue)' }}>
            {isUser ? 'Vous' : 'E-ZZIO'}
          </span>
          {message.model && (
            <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.6 }}>
              {message.model}
            </span>
          )}
          <span style={{ opacity: 0.5 }}>{time}</span>
        </div>

        <div
          style={{
            padding: '10px 14px',
            background: isUser ? 'var(--accent-blue)' : 'var(--bg-card)',
            color: isUser ? '#fff' : 'var(--text-primary)',
            borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
            border: isUser ? 'none' : '1px solid var(--border-subtle)',
            fontSize: 13,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}