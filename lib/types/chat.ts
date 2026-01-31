/**
 * Type definitions for chat functionality
 */

export interface User {
  id?: number;
  email: string;
  name: string;
  team: 'business' | 'product' | 'marketing' | 'growth' | 'executive';
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  result?: string;
  status: 'calling' | 'done';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent?: string;
  metadata?: MessageMetadata;
  toolCalls?: ToolCall[];
  timestamp: Date;
}

export interface MessageMetadata {
  visualization?: Visualization;
  metrics?: Record<string, any>;
  sources?: string[];
}

export interface Visualization {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  data: Array<Record<string, any>>;
  xAxis?: string;
  yAxis?: string;
  colors?: string[];
}

export interface ChatSession {
  id: string;
  userId: number;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamMessage {
  type: 'text' | 'result' | 'tool' | 'session' | 'error';
  content?: string;
  agent?: string;
  sessionId?: string;
  tool?: string;
}
