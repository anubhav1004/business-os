'use client';

import { Plus, Clock, ChevronDown, ArrowUp } from 'lucide-react';

interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
}

export default function MessageInput({
  input,
  setInput,
  onSend,
  onKeyPress,
  isLoading,
}: MessageInputProps) {
  return (
    <div className="input-container">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyPress}
        placeholder="Ask about your business metrics, trends, or insights..."
        className="w-full bg-transparent text-[#e5e5e5] placeholder-[#737373] px-5 py-4 text-base resize-none focus:outline-none"
        rows={1}
        style={{ minHeight: '56px', maxHeight: '200px' }}
        disabled={isLoading}
      />

      {/* Input Actions Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#404040]">
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-[#404040] rounded-lg transition-colors"
            title="Add attachment"
          >
            <Plus size={20} className="text-[#a3a3a3]" />
          </button>
          <button
            className="p-2 hover:bg-[#404040] rounded-lg transition-colors"
            title="Recent prompts"
          >
            <Clock size={20} className="text-[#a3a3a3]" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Agent Selector */}
          <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#404040] rounded-lg transition-colors">
            <span className="text-sm text-[#a3a3a3]">Coordinator</span>
            <ChevronDown size={16} className="text-[#737373]" />
          </button>

          {/* Send Button */}
          <button
            onClick={onSend}
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 rounded-lg bg-[#e5e5e5] hover:bg-white disabled:bg-[#404040] disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <ArrowUp size={18} className={isLoading ? 'text-[#737373]' : 'text-[#1a1a1a]'} />
          </button>
        </div>
      </div>
    </div>
  );
}
