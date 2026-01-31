'use client';

import { Plus, Clock, ChevronDown, ArrowUp, Users, DollarSign, TrendingUp, Search, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  userName: string;
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  onQuickAction: (prompt: string) => void;
}

const quickActions = [
  {
    icon: Users,
    label: 'Product',
    description: 'User behavior & retention',
  },
  {
    icon: DollarSign,
    label: 'Marketing',
    description: 'Campaign ROI & ROAS',
  },
  {
    icon: TrendingUp,
    label: 'Growth',
    description: 'Traffic & SEO metrics',
  },
  {
    icon: Search,
    label: 'Research',
    description: 'Market & competitors',
  },
  {
    icon: Sparkles,
    label: "AI's choice",
    description: 'Let AI decide',
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function WelcomeScreen({
  userName,
  input,
  setInput,
  onSend,
  onKeyPress,
  isLoading,
  onQuickAction,
}: WelcomeScreenProps) {
  const greeting = getGreeting();
  const firstName = userName.split(' ')[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4">
      {/* Greeting */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="3" fill="#e07a5f" />
            <circle cx="16" cy="6" r="2" fill="#e07a5f" />
            <circle cx="16" cy="26" r="2" fill="#e07a5f" />
            <circle cx="6" cy="16" r="2" fill="#e07a5f" />
            <circle cx="26" cy="16" r="2" fill="#e07a5f" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="#e07a5f" opacity="0.7" />
            <circle cx="23.5" cy="8.5" r="1.5" fill="#e07a5f" opacity="0.7" />
            <circle cx="8.5" cy="23.5" r="1.5" fill="#e07a5f" opacity="0.7" />
            <circle cx="23.5" cy="23.5" r="1.5" fill="#e07a5f" opacity="0.7" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#e5e5e5]">
          {greeting}, <span className="font-normal">{firstName}</span>
        </h1>
      </div>

      {/* Input Container */}
      <div className="w-full max-w-2xl mb-6">
        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyPress}
            placeholder="How can I help you today?"
            className="w-full bg-transparent text-[#e5e5e5] placeholder-[#737373] px-5 py-4 text-base resize-none focus:outline-none"
            rows={1}
            style={{ minHeight: '56px', maxHeight: '200px' }}
            disabled={isLoading}
            autoFocus
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
                <ArrowUp size={18} className="text-[#1a1a1a]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Chips */}
      <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => onQuickAction(action.label)}
              className="action-chip"
            >
              <Icon size={16} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
