'use client';

import { User } from '@/lib/types/chat';
import { Menu, Bot } from 'lucide-react';

interface ChatHeaderProps {
  user: User;
  messagesCount: number;
}

export default function ChatHeader({ user, messagesCount }: ChatHeaderProps) {
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 safe-top">
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Left side - Logo and title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Business AI
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {messagesCount > 0 ? `${messagesCount} messages` : 'Start a conversation'}
              </p>
            </div>
          </div>

          {/* Right side - User info */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User badge - hidden on very small screens */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user.team}
              </span>
            </div>

            {/* Mobile menu button */}
            <button
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
