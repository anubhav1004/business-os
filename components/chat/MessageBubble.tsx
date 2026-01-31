'use client';

import { Message } from '@/lib/types/chat';
import { User, AlertCircle, Sparkles } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="flex gap-3 max-w-[80%]">
          <div className="message-user">
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </div>
          </div>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    );
  }

  if (isSystem) {
    return (
      <div className="flex justify-start">
        <div className="flex gap-3 max-w-[80%]">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="bg-red-900/30 border border-red-800/50 text-red-200 rounded-2xl px-4 py-3">
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex justify-start">
      <div className="flex gap-3 max-w-[85%]">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e07a5f]/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#e07a5f]" />
        </div>
        <div className="flex flex-col gap-1">
          {message.agent && (
            <div className="text-xs text-[#737373] capitalize">
              {message.agent} agent
            </div>
          )}
          <div className="message-assistant">
            <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
