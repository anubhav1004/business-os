'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Folder,
  Star,
  Clock,
  Database,
  ChevronDown,
  Settings,
  Users,
  TrendingUp,
  DollarSign,
  BarChart3,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onNewChat: () => void;
}

const recentChats = [
  { id: 1, title: 'Q4 Revenue Analysis', time: '2h ago' },
  { id: 2, title: 'User Retention Deep Dive', time: '5h ago' },
  { id: 3, title: 'Marketing Campaign ROI', time: 'Yesterday' },
  { id: 4, title: 'Competitor Research', time: 'Yesterday' },
  { id: 5, title: 'Growth Metrics Review', time: '3 days ago' },
];

const dataSources = [
  { name: 'Mixpanel', connected: true },
  { name: 'Google Analytics', connected: true },
  { name: 'Google Ads', connected: false },
];

export default function Sidebar({ isOpen, onClose, userName, onNewChat }: SidebarProps) {
  const [showDataSources, setShowDataSources] = useState(false);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#e5e5e5] hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>New analysis</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-3 mb-2">
          <button className="sidebar-item w-full">
            <Search size={18} />
            <span>Search</span>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="px-1">
          <button className="sidebar-item w-full">
            <MessageSquare size={18} />
            <span>Analyses</span>
          </button>
          <button className="sidebar-item w-full">
            <Folder size={18} />
            <span>Projects</span>
          </button>
          <button className="sidebar-item w-full">
            <BarChart3 size={18} />
            <span>Dashboards</span>
          </button>
        </nav>

        {/* Data Sources Section */}
        <div className="mt-4 px-1">
          <button
            onClick={() => setShowDataSources(!showDataSources)}
            className="sidebar-item w-full justify-between"
          >
            <div className="flex items-center gap-3">
              <Database size={18} />
              <span>Data Sources</span>
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform ${showDataSources ? 'rotate-180' : ''}`}
            />
          </button>

          {showDataSources && (
            <div className="ml-6 mt-1 space-y-1">
              {dataSources.map((source) => (
                <div
                  key={source.name}
                  className="flex items-center justify-between px-4 py-2 text-sm text-[#a3a3a3]"
                >
                  <span>{source.name}</span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      source.connected ? 'bg-green-500' : 'bg-[#404040]'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Starred Section */}
        <div className="sidebar-section-title">Starred</div>
        <div className="px-1">
          <button className="sidebar-item w-full">
            <Star size={16} className="text-yellow-500" />
            <span className="truncate">Weekly KPI Dashboard</span>
          </button>
        </div>

        {/* Recents Section */}
        <div className="sidebar-section-title">Recents</div>
        <div className="flex-1 overflow-y-auto px-1 scrollbar-hide">
          {recentChats.map((chat) => (
            <button key={chat.id} className="sidebar-item w-full group">
              <Clock size={16} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="truncate flex-1 text-left">{chat.title}</span>
            </button>
          ))}
        </div>

        {/* User Section */}
        <div className="border-t border-[#333] p-3 mt-auto">
          <button className="sidebar-item w-full justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm text-[#e5e5e5]">{userName}</span>
                <span className="text-xs text-[#737373]">Pro plan</span>
              </div>
            </div>
            <ChevronDown size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
