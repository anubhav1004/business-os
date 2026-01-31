/**
 * Type definitions for agent system
 */

export interface AgentConfig {
  name: string;
  description: string;
  tools: string[];
  mcpServers?: Record<string, any>;
}

export interface AgentMessage {
  type: string;
  subtype?: string;
  text?: string;
  tool_name?: string;
  tool_use_id?: string;
  input?: any;
  result?: string;
  session_id?: string;
}

export type TeamPermissions = {
  [team: string]: string[];
};
