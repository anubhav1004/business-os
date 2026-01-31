/**
 * Chat Interface Component Example
 *
 * This should be placed in: components/chat/ChatInterface.tsx
 *
 * Main chat interface with message history and streaming responses.
 */

'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent?: string;
  timestamp: Date;
}

export default function ChatInterface({ userEmail }: { userEmail: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentAgent, setCurrentAgent] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          sessionId,
          userEmail,
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

              if (parsed.type === 'text' || parsed.type === 'result') {
                assistantContent += parsed.content;

                // Update or create assistant message
                setMessages((prev) => {
                  const existingIndex = prev.findIndex(
                    (m) => m.id === assistantMessageId
                  );

                  if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = {
                      ...updated[existingIndex],
                      content: assistantContent,
                    };
                    return updated;
                  } else {
                    return [
                      ...prev,
                      {
                        id: assistantMessageId,
                        role: 'assistant',
                        content: assistantContent,
                        agent: currentAgent,
                        timestamp: new Date(),
                      },
                    ];
                  }
                });
              } else if (parsed.type === 'tool') {
                setCurrentAgent(parsed.agent || 'coordinator');
              } else if (parsed.type === 'session') {
                setSessionId(parsed.sessionId);
              } else if (parsed.type === 'error') {
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
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Business AI</h1>
        <p className="text-gray-600">
          Ask questions about your business data and get insights from specialized agents
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-4">Ask me anything about your business!</p>
            <div className="grid grid-cols-2 gap-2 max-w-2xl mx-auto text-sm">
              <button
                onClick={() => setInput("What's our product performance this month?")}
                className="p-3 border rounded hover:bg-gray-50"
              >
                📱 Product Performance
              </button>
              <button
                onClick={() => setInput("Show me our ad ROI")}
                className="p-3 border rounded hover:bg-gray-50"
              >
                💰 Marketing ROI
              </button>
              <button
                onClick={() => setInput("Analyze organic traffic trends")}
                className="p-3 border rounded hover:bg-gray-50"
              >
                🌱 Growth Metrics
              </button>
              <button
                onClick={() => setInput("Research our top competitors")}
                className="p-3 border rounded hover:bg-gray-50"
              >
                🔍 Competitor Research
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.role === 'system'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.agent && (
                <div className="text-xs opacity-70 mb-1">
                  {message.agent} agent
                </div>
              )}
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && currentAgent && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="text-xs text-gray-600 mb-1">{currentAgent} agent</div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about your business metrics, trends, or insights..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
