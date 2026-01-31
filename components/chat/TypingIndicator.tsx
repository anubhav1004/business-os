'use client';

import { Sparkles } from 'lucide-react';

interface TypingIndicatorProps {
  agentName: string;
}

export default function TypingIndicator({ agentName }: TypingIndicatorProps) {
  return (
    <div className="flex justify-start">
      <div className="flex gap-3 max-w-[85%]">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e07a5f]/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#e07a5f] animate-pulse" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-xs text-[#737373] capitalize">
            {agentName} agent
          </div>
          <div className="flex items-center gap-1.5 py-3">
            <div className="w-2 h-2 rounded-full bg-[#e07a5f] animate-bounce-delay-1"></div>
            <div className="w-2 h-2 rounded-full bg-[#e07a5f] animate-bounce-delay-2"></div>
            <div className="w-2 h-2 rounded-full bg-[#e07a5f] animate-bounce-delay-3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
