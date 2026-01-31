/**
 * Mixpanel MCP Server
 *
 * Provides tools for querying Mixpanel analytics data.
 * This is an example implementation - adjust based on your Mixpanel setup.
 */

export interface MixpanelConfig {
  projectId: string;
  apiSecret: string;
}

/**
 * Create Mixpanel MCP server configuration
 */
export function createMixpanelMCP(config: MixpanelConfig) {
  const baseURL = 'https://mixpanel.com/api/2.0';
  const auth = Buffer.from(`${config.apiSecret}:`).toString('base64');

  return {
    name: 'mixpanel',
    version: '1.0.0',
    tools: [
      {
        name: 'get_active_users',
        description: 'Get active users count for a date range',
        inputSchema: {
          type: 'object',
          properties: {
            from_date: {
              type: 'string',
              format: 'date',
              description: 'Start date (YYYY-MM-DD)',
            },
            to_date: {
              type: 'string',
              format: 'date',
              description: 'End date (YYYY-MM-DD)',
            },
            event: {
              type: 'string',
              description: 'Optional event name to filter by',
            },
          },
          required: ['from_date', 'to_date'],
        },
        execute: async (input: any) => {
          const response = await fetch(`${baseURL}/engage`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from_date: input.from_date,
              to_date: input.to_date,
              event: input.event,
            }),
          });

          if (!response.ok) {
            throw new Error(`Mixpanel API error: ${response.statusText}`);
          }

          return await response.json();
        },
      },
      {
        name: 'get_funnel',
        description: 'Analyze conversion funnel between events',
        inputSchema: {
          type: 'object',
          properties: {
            funnel_id: {
              type: 'string',
              description: 'Funnel ID from Mixpanel',
            },
            from_date: {
              type: 'string',
              format: 'date',
            },
            to_date: {
              type: 'string',
              format: 'date',
            },
            events: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of event names in funnel order',
            },
          },
          required: ['from_date', 'to_date'],
        },
        execute: async (input: any) => {
          const response = await fetch(`${baseURL}/funnels`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
          });

          if (!response.ok) {
            throw new Error(`Mixpanel API error: ${response.statusText}`);
          }

          return await response.json();
        },
      },
      {
        name: 'get_retention',
        description: 'Get retention data for users',
        inputSchema: {
          type: 'object',
          properties: {
            from_date: {
              type: 'string',
              format: 'date',
            },
            to_date: {
              type: 'string',
              format: 'date',
            },
            retention_type: {
              type: 'string',
              enum: ['birth', 'compounded'],
              description: 'Type of retention analysis',
            },
            born_event: {
              type: 'string',
              description: 'Event that defines cohort birth',
            },
          },
          required: ['from_date', 'to_date'],
        },
        execute: async (input: any) => {
          const response = await fetch(`${baseURL}/retention`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
          });

          if (!response.ok) {
            throw new Error(`Mixpanel API error: ${response.statusText}`);
          }

          return await response.json();
        },
      },
      {
        name: 'query_events',
        description: 'Query specific events with filters',
        inputSchema: {
          type: 'object',
          properties: {
            event: {
              type: 'string',
              description: 'Event name to query',
            },
            from_date: {
              type: 'string',
              format: 'date',
            },
            to_date: {
              type: 'string',
              format: 'date',
            },
            where: {
              type: 'string',
              description: 'Optional filter expression',
            },
          },
          required: ['event', 'from_date', 'to_date'],
        },
        execute: async (input: any) => {
          const params = new URLSearchParams({
            event: input.event,
            from_date: input.from_date,
            to_date: input.to_date,
            ...(input.where && { where: input.where }),
          });

          const response = await fetch(`${baseURL}/events?${params}`, {
            headers: {
              'Authorization': `Basic ${auth}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Mixpanel API error: ${response.statusText}`);
          }

          return await response.json();
        },
      },
    ],
  };
}

/**
 * Example usage in coordinator agent:
 *
 * ```typescript
 * const mixpanelMCP = createMixpanelMCP({
 *   projectId: process.env.MIXPANEL_PROJECT_ID!,
 *   apiSecret: process.env.MIXPANEL_API_SECRET!,
 * });
 *
 * const options: ClaudeAgentOptions = {
 *   mcpServers: {
 *     mixpanel: mixpanelMCP,
 *   },
 * };
 * ```
 */
