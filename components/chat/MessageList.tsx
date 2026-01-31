'use client';

import { Message } from '@/lib/types/chat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  currentAgent: string;
}

export default function MessageList({
  messages,
  isLoading,
  currentAgent,
}: MessageListProps) {
  return (
    <div className="space-y-6 py-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isLoading && currentAgent && (
        <TypingIndicator agentName={currentAgent} />
      )}
    </div>
  );
}
