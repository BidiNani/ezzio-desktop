import React from 'react';
import { ChatMessage } from '../../types';
import { MessageList } from './MessageList';
import { ChatComposer } from './ChatComposer';

interface ChatScreenProps {
  messages: ChatMessage[];
  sending: boolean;
  onSendMessage: (text: string) => void;
  connected: boolean;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  sending,
  onSendMessage,
  connected,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        maxWidth: 1000,
        margin: '0 auto',
      }}
    >
      <MessageList messages={messages} sending={sending} />
      <ChatComposer onSend={onSendMessage} sending={sending} disabled={!connected} />
    </div>
  );
};
