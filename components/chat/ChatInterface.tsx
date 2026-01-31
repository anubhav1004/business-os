'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../layout/Sidebar';
import WelcomeScreen from './WelcomeScreen';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Message, User } from '@/lib/types/chat';

interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  result?: string;
  status: 'calling' | 'done';
}

interface ChatInterfaceProps {
  user: User;
}

export default function ChatInterface({ user }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentAgent, setCurrentAgent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [thinkingStatus, setThinkingStatus] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, toolCalls]);

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setCurrentAgent('');
    setError(null);
    setToolCalls([]);
    setThinkingStatus('');
    setSidebarOpen(false);
  };

  const handleQuickAction = (actionLabel: string) => {
    const prompts: Record<string, string> = {
      'Product': "What were our signups yesterday? Show me the trend for the last 7 days.",
      'Marketing': 'What is our signup to subscription conversion rate?',
      'Growth': 'Compare our signups this week vs last week.',
      'Research': 'Give me a full business summary with all available metrics.',
      "AI's choice": 'Give me a CEO briefing with key metrics and insights.',
    };
    setInput(prompts[actionLabel] || '');
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setToolCalls([]);
    setThinkingStatus('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          sessionId,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let assistantMessageId = `msg_${Date.now()}_assistant`;
      let assistantContent = '';
      let currentToolCalls: ToolCall[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'thinking') {
                setThinkingStatus(parsed.content);
              } else if (parsed.type === 'tool_call') {
                const newToolCall: ToolCall = {
                  id: parsed.id,
                  name: parsed.tool,
                  args: parsed.args,
                  status: 'calling',
                };
                currentToolCalls = [...currentToolCalls, newToolCall];
                setToolCalls(currentToolCalls);
                setCurrentAgent(parsed.tool);
              } else if (parsed.type === 'tool_result') {
                currentToolCalls = currentToolCalls.map((tc) =>
                  tc.id === parsed.id
                    ? { ...tc, result: parsed.result, status: 'done' as const }
                    : tc
                );
                setToolCalls(currentToolCalls);
              } else if (parsed.type === 'text') {
                assistantContent += parsed.content;
                setThinkingStatus('');

                setMessages((prev) => {
                  const existingIndex = prev.findIndex(
                    (m) => m.id === assistantMessageId
                  );

                  const messageWithTools: Message = {
                    id: assistantMessageId,
                    role: 'assistant',
                    content: assistantContent,
                    agent: 'coordinator',
                    timestamp: new Date(),
                    toolCalls: currentToolCalls.length > 0 ? currentToolCalls : undefined,
                  };

                  if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = messageWithTools;
                    return updated;
                  } else {
                    return [...prev, messageWithTools];
                  }
                });
              } else if (parsed.type === 'session') {
                setSessionId(parsed.sessionId);
              } else if (parsed.type === 'error') {
                setError(parsed.content);
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `msg_${Date.now()}_error`,
                    role: 'system',
                    content: `Error: ${parsed.content}`,
                    timestamp: new Date(),
                  },
                ]);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}_error`,
          role: 'system',
          content: 'Failed to send message. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setCurrentAgent('');
      setThinkingStatus('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="flex h-full bg-[#1a1a1a]">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={user.name}
        onNewChat={handleNewChat}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#333]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <Menu size={24} className="text-[#a3a3a3]" />
          </button>
          <span className="text-[#e5e5e5] font-medium">Business AI</span>
          <div className="w-10" />
        </header>

        {/* Content Area */}
        {showWelcome ? (
          <WelcomeScreen
            userName={user.name}
            input={input}
            setInput={setInput}
            onSend={sendMessage}
            onKeyPress={handleKeyPress}
            isLoading={isLoading}
            onQuickAction={handleQuickAction}
          />
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-4">
              <div className="max-w-3xl mx-auto">
                <MessageList
                  messages={messages}
                  isLoading={isLoading}
                  currentAgent={currentAgent}
                />

                {/* Tool Calls Display */}
                {isLoading && toolCalls.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {toolCalls.map((tc) => (
                      <div
                        key={tc.id}
                        className="bg-[#2a2a2a] border border-[#404040] rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <span className={tc.status === 'calling' ? 'animate-pulse' : ''}>
                            {tc.status === 'calling' ? '🔧' : '✅'}
                          </span>
                          <span className="text-blue-400 font-mono">{tc.name}</span>
                          {tc.status === 'calling' && (
                            <span className="text-[#737373] text-xs">calling...</span>
                          )}
                        </div>
                        {Object.keys(tc.args).length > 0 && (
                          <div className="mt-1 text-xs text-[#737373] font-mono">
                            {JSON.stringify(tc.args)}
                          </div>
                        )}
                        {tc.result && (
                          <div className="mt-2 text-xs text-green-400 font-mono bg-[#1a1a1a] p-2 rounded max-h-20 overflow-auto">
                            {tc.result.length > 200 ? tc.result.slice(0, 200) + '...' : tc.result}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Thinking Status */}
                {isLoading && thinkingStatus && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-[#737373]">
                    <div className="animate-spin w-4 h-4 border-2 border-[#404040] border-t-blue-400 rounded-full" />
                    <span>{thinkingStatus}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="px-4 sm:px-6 lg:px-8 pb-2">
                <div className="max-w-3xl mx-auto bg-red-900/50 border border-red-800 text-red-200 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-[#333] bg-[#1a1a1a] safe-bottom">
              <div className="px-4 sm:px-6 lg:px-8 py-4">
                <div className="max-w-3xl mx-auto">
                  <MessageInput
                    input={input}
                    setInput={setInput}
                    onSend={sendMessage}
                    onKeyPress={handleKeyPress}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
