# MCP Servers for External API Integrations

This directory contains Model Context Protocol (MCP) server implementations for integrating with external analytics and data APIs.

## What are MCP Servers?

MCP servers provide a standardized way to give AI agents access to external tools and data sources. Each MCP server exposes a set of tools that agents can call to fetch and analyze data.

## Available MCP Servers

### 1. Mixpanel (`mixpanel.ts`)

**Status**: Example implementation
**Tools**:
- `get_active_users` - Get active user counts for a date range
- `get_funnel` - Analyze conversion funnels
- `get_retention` - Get user retention data
- `query_events` - Query specific events with filters

**Setup**:
```typescript
import { createMixpanelMCP } from './lib/mcp/mixpanel';

const mixpanelMCP = createMixpanelMCP({
  projectId: process.env.MIXPANEL_PROJECT_ID!,
  apiSecret: process.env.MIXPANEL_API_SECRET!,
});
```

**Environment Variables**:
- `MIXPANEL_PROJECT_ID`
- `MIXPANEL_API_SECRET`

### 2. Google Analytics 4 (`google-analytics.ts`)

**Status**: Example implementation
**Tools**:
- `get_traffic_data` - Get website traffic for date range
- `get_conversion_data` - Get conversion metrics
- `get_top_pages` - Get top performing pages
- `get_traffic_sources` - Get traffic source breakdown

**Setup**:
```typescript
import { createGoogleAnalyticsMCP } from './lib/mcp/google-analytics';

const gaMCP = createGoogleAnalyticsMCP({
  propertyId: process.env.GA4_PROPERTY_ID!,
  credentials: JSON.parse(process.env.GA4_CREDENTIALS!),
});
```

**Dependencies**:
```bash
npm install @google-analytics/data
```

**Environment Variables**:
- `GA4_PROPERTY_ID`
- `GA4_CREDENTIALS` (JSON service account key)

### 3. App Store Connect (TODO)

Tools to fetch:
- App downloads
- Ratings and reviews
- Crash analytics
- App Store metrics

### 4. Google Sheets (TODO)

Tools to:
- Read sheet data
- Write to sheets
- Update cells
- Create charts

### 5. Ads APIs (TODO)

#### Google Ads
- Campaign performance
- Ad group metrics
- Keyword data
- Budget tracking

#### Meta Ads (Facebook/Instagram)
- Campaign metrics
- Ad creative performance
- Audience insights
- ROI tracking

#### LinkedIn Ads
- B2B campaign data
- Lead generation metrics
- Demographic insights

#### TikTok Ads
- Video ad performance
- Engagement metrics
- Audience data

## Creating a New MCP Server

Follow this template to create a new MCP server:

```typescript
export interface YourServiceConfig {
  apiKey: string;
  // other config...
}

export function createYourServiceMCP(config: YourServiceConfig) {
  return {
    name: 'your-service',
    version: '1.0.0',
    tools: [
      {
        name: 'tool_name',
        description: 'What this tool does',
        inputSchema: {
          type: 'object',
          properties: {
            param1: {
              type: 'string',
              description: 'Parameter description',
            },
          },
          required: ['param1'],
        },
        execute: async (input: any) => {
          // Implement API call here
          const response = await fetch(/* ... */);
          return await response.json();
        },
      },
    ],
  };
}
```

## Using MCP Servers with Agents

Pass MCP servers to the coordinator agent:

```typescript
import { runCoordinator } from './lib/agents/coordinator';
import { createMixpanelMCP } from './lib/mcp/mixpanel';
import { createGoogleAnalyticsMCP } from './lib/mcp/google-analytics';

const mcpServers = {
  mixpanel: createMixpanelMCP({ /* config */ }),
  'google-analytics': createGoogleAnalyticsMCP({ /* config */ }),
};

for await (const message of runCoordinator(
  userPrompt,
  userTeam,
  sessionId,
  mcpServers
)) {
  // Handle messages
}
```

## Best Practices

1. **Error Handling**: Always handle API errors gracefully
2. **Rate Limiting**: Implement rate limiting for API calls
3. **Caching**: Cache responses when appropriate
4. **Credentials**: Never hardcode credentials, use environment variables
5. **Validation**: Validate inputs before making API calls
6. **Documentation**: Document all tools and parameters clearly

## Testing MCP Servers

Test each MCP server individually:

```typescript
const mcp = createMixpanelMCP({ /* config */ });

// Test a tool
const result = await mcp.tools[0].execute({
  from_date: '2024-01-01',
  to_date: '2024-01-31',
});

console.log(result);
```

## Security Considerations

1. **Encrypt API credentials** before storing in database
2. **Use environment variables** for development
3. **Implement proper authentication** in production
4. **Rate limit API calls** to prevent abuse
5. **Audit log all API calls** for compliance

## Resources

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP Server Examples](https://github.com/modelcontextprotocol/servers)
- [Claude Agent SDK - MCP Documentation](https://platform.claude.com/docs/en/agent-sdk/mcp)
