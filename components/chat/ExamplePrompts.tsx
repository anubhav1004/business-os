'use client';

import { TrendingUp, DollarSign, Users, Search } from 'lucide-react';

interface ExamplePromptsProps {
  onExampleClick: (text: string) => void;
}

const examples = [
  {
    icon: Users,
    title: 'Product Analytics',
    prompt: "What's our 7-day retention rate this month?",
    color: 'bg-blue-500',
  },
  {
    icon: DollarSign,
    title: 'Marketing ROI',
    prompt: 'Show me our ROAS across all advertising platforms',
    color: 'bg-green-500',
  },
  {
    icon: TrendingUp,
    title: 'Growth Metrics',
    prompt: 'Analyze our organic traffic trends over the last 3 months',
    color: 'bg-purple-500',
  },
  {
    icon: Search,
    title: 'Market Research',
    prompt: 'Research our top 5 competitors and their key features',
    color: 'bg-orange-500',
  },
];

export default function ExamplePrompts({ onExampleClick }: ExamplePromptsProps) {
  return (
    <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {examples.map((example, index) => {
        const Icon = example.icon;
        return (
          <button
            key={index}
            onClick={() => onExampleClick(example.prompt)}
            className="group relative p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800
              border-2 border-gray-200 dark:border-gray-700
              hover:border-primary-500 dark:hover:border-primary-400
              hover:shadow-lg transition-all duration-200
              text-left active:scale-[0.98] touch-manipulation"
          >
            {/* Icon */}
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${example.color}
                flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">
              {example.title}
            </h3>

            {/* Prompt text */}
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {example.prompt}
            </p>

            {/* Hover indicator */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-white text-xs">→</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
