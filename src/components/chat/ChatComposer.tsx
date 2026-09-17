import React, { useState } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';

interface ChatComposerProps {
  onSend: (text: string) => void;
  sending: boolean;
  disabled?: boolean;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSend,
  sending,
  disabled = false,
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Actions bar (attachments, voice UI placeholders) */}
        <button
          type="button"
          title="Joindre un fichier (UI)"
          onClick={() => alert('Sélection de fichier : fonction visuelle préparée.')}
          disabled={sending || disabled}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 8,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paperclip size={18} />
        </button>

        <button
          type="button"
          title="Entrée vocale (UI)"
          onClick={() => alert('Entrée vocale : fonction visuelle préparée.')}
          disabled={sending || disabled}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 8,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Mic size={18} />
        </button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Envoyer une instruction au Master Governor... (Entrée pour envoyer)"
          disabled={sending || disabled}
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: 14,
            fontFamily: 'inherit',
            lineHeight: 1.4,
            outline: 'none',
            minHeight: 42,
            maxHeight: 120,
          }}
        />

        <button
          type="submit"
          disabled={!text.trim() || sending || disabled}
          className="btn-primary"
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            minWidth: 44,
          }}
        >
          <Send size={16} />
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--text-muted)',
          padding: '0 4px',
        }}
      >
        <span>Routage souverain E-ZZIO (ModelRouter autoritaire)</span>
        <span>Maj+Entrée pour saut de ligne</span>
      </div>
    </form>
  );
};
