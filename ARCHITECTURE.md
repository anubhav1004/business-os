# Business AI - Multi-Agent Architecture

## Overview

A multi-agent business intelligence platform that analyzes your entire business using specialized AI agents with access to real data from various APIs (Google Analytics, Mixpanel, App Store Connect, Google Sheets, Ads APIs, etc.).

## System Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                     Next.js Web Application                    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │         Chat Interface (React Components)             │    │
│  │  - Message history                                    │    │
│  │  - Real-time streaming responses                      │    │
│  │  - Data visualizations (charts, graphs)               │    │
│  │  - Report generation                                  │    │
│  └────────────────────┬─────────────────────────────────┘    │
│                       │                                        │
│  ┌────────────────────▼─────────────────────────────────┐    │
│  │         API Routes (/app/api/*)                       │    │
│  │  - POST /api/chat          - Main chat endpoint       │    │
│  │  - GET  /api/sessions      - Session management       │    │
│  │  - GET  /api/analytics     - Analytics dashboard      │    │
│  │  - POST /api/visualize     - Generate charts          │    │
│  └────────────────────┬─────────────────────────────────┘    │
└────────────────────────┼──────────────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────────────┐
│                  Coordinator Agent (Main)                      │
│                                                                │
│  Responsibilities:                                             │
│  - Analyzes incoming user requests                            │
│  - Determines which specialized agent(s) to invoke            │
│  - Coordinates multi-agent workflows                          │
│  - Synthesizes results from multiple agents                   │
│  - Manages conversation context and history                   │
│  - Routes based on team permissions                           │
│                                                                │
│  Agent Definition:                                             │
│  {                                                             │
│    description: "Main coordinator for business intelligence", │
│    tools: ["Task", "Read", "Write"],                          │
│    agents: {                                                   │
│      "product-agent": {...},                                   │
│      "marketing-agent": {...},                                 │
│      "growth-agent": {...},                                    │
│      "research-agent": {...}                                   │
│    }                                                           │
│  }                                                             │
└────────────────────────┬──────────────────────────────────────┘
                         │
        ┌────────────────┼───────────────┬────────────────┐
        │                │               │                │
┌───────▼──────┐ ┌───────▼──────┐ ┌─────▼────────┐ ┌────▼──────────┐
│   Product    │ │   Marketing  │ │    Growth    │ │    Research   │
│    Agent     │ │     Agent    │ │    Agent     │ │     Agent     │
│              │ │              │ │              │ │               │
│ Specializes  │ │ Specializes  │ │ Specializes  │ │ Specializes   │
│ in:          │ │ in:          │ │ in:          │ │ in:           │
│              │ │              │ │              │ │               │
│ - Product    │ │ - Paid ads   │ │ - Organic    │ │ - Market      │
│   analytics  │ │   analysis   │ │   growth     │ │   research    │
│ - User       │ │ - Campaign   │ │ - SEO        │ │ - Competitor  │
│   behavior   │ │   performance│ │ - Social     │ │   analysis    │
│ - App store  │ │ - ROI/ROAS   │ │ - Viral      │ │ - Industry    │
│   metrics    │ │ - Budget     │ │   metrics    │ │   trends      │
│ - Feature    │ │   optimization│ │ - Content   │ │ - Web scraping│
│   adoption   │ │              │ │   performance│ │               │
│              │ │              │ │              │ │               │
│ Data Sources:│ │ Data Sources:│ │ Data Sources:│ │ Data Sources: │
│ - Mixpanel   │ │ - Google Ads │ │ - GA4        │ │ - WebSearch   │
│ - App Store  │ │ - Meta Ads   │ │ - Search     │ │ - WebFetch    │
│   Connect    │ │ - LinkedIn   │ │   Console    │ │ - API docs    │
│ - Google     │ │   Ads        │ │ - Social     │ │               │
│   Sheets     │ │ - TikTok Ads │ │   media APIs │ │               │
│              │ │              │ │              │ │               │
│ Tools:       │ │ Tools:       │ │ Tools:       │ │ Tools:        │
│ - MCP tools  │ │ - MCP tools  │ │ - MCP tools  │ │ - WebSearch   │
│ - Read/Write │ │ - Read/Write │ │ - Read/Write │ │ - WebFetch    │
│ - Bash       │ │ - Bash       │ │ - Bash       │ │ - Read/Write  │
└───────┬──────┘ └───────┬──────┘ └─┬────────────┘ └────┬──────────┘
        │                │           │                   │
        └────────────────┴───────────┴───────────────────┘
                         │
            ┌────────────▼───────────┐
            │   MCP Server Layer     │
            │   (API Integrations)   │
            │                        │
            │  - mixpanel-mcp        │
            │  - google-analytics-mcp│
            │  - app-store-mcp       │
            │  - google-sheets-mcp   │
            │  - ads-api-mcp         │
            └────────────┬───────────┘
                         │
            ┌────────────▼───────────┐
            │    External APIs       │
            │                        │
            │  - Mixpanel API        │
            │  - Google Analytics    │
            │  - App Store Connect   │
            │  - Google Sheets       │
            │  - Google Ads          │
            │  - Meta Ads            │
            └────────────────────────┘
```

## Project Structure

```
business-ai/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── chat/
│   │   │   └── route.ts         # Main chat endpoint
│   │   ├── sessions/
│   │   │   └── route.ts         # Session management
│   │   └── visualize/
│   │       └── route.ts         # Chart generation
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page with chat
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── chat/
│   │   ├── ChatInterface.tsx    # Main chat UI
│   │   ├── MessageList.tsx      # Message display
│   │   ├── MessageInput.tsx     # Input component
│   │   └── StreamingMessage.tsx # Real-time streaming
│   ├── visualizations/
│   │   ├── ChartRenderer.tsx    # Dynamic chart display
│   │   ├── ReportViewer.tsx     # Report display
│   │   └── MetricsCard.tsx      # Metric cards
│   └── ui/
│       ├── Button.tsx           # UI components
│       ├── Card.tsx
│       └── LoadingSpinner.tsx
│
├── lib/                         # Core libraries
│   ├── agents/
│   │   ├── coordinator.ts       # Main coordinator agent
│   │   ├── product-agent.ts     # Product analytics agent
│   │   ├── marketing-agent.ts   # Marketing agent
│   │   ├── growth-agent.ts      # Growth agent
│   │   └── research-agent.ts    # Research agent
│   ├── db/
│   │   ├── schema.ts            # Database schema
│   │   ├── client.ts            # SQLite client
│   │   └── migrations/          # Database migrations
│   ├── mcp/
│   │   ├── mixpanel.ts          # Mixpanel MCP server
│   │   ├── google-analytics.ts  # GA MCP server
│   │   ├── app-store.ts         # App Store MCP server
│   │   ├── google-sheets.ts     # Sheets MCP server
│   │   └── ads-api.ts           # Ads API MCP server
│   ├── types/
│   │   ├── agent.ts             # Agent types
│   │   ├── message.ts           # Message types
│   │   └── analytics.ts         # Analytics types
│   └── utils/
│       ├── permissions.ts       # Team permissions
│       └── visualization.ts     # Chart generation
│
├── public/                      # Static assets
├── .env.example                 # Environment variables template
├── .env.local                   # Local environment (gitignored)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## Agent Definitions

### 1. Coordinator Agent

**Purpose**: Routes requests to specialized agents and synthesizes results

**Capabilities**:
- Analyzes user intent
- Determines which agent(s) to invoke
- Manages multi-agent workflows
- Combines results from multiple agents
- Handles team-based permissions

**Example Query Routing**:
- "How is our product performing?" → Product Agent
- "What's our ad ROI?" → Marketing Agent
- "Show me organic growth trends" → Growth Agent
- "Research competitor pricing" → Research Agent
- "Give me a full business overview" → All agents

### 2. Product Agent

**Team**: Product Team

**Data Sources**:
- Mixpanel (user behavior, events, funnels)
- App Store Connect (ratings, reviews, downloads)
- Google Sheets (custom product data)

**Capabilities**:
- Analyze user engagement and retention
- Track feature adoption
- Monitor app store performance
- Identify user behavior patterns
- Generate product insights and recommendations

**Example Queries**:
- "What's our 7-day retention rate?"
- "Which features have the highest adoption?"
- "Show me user funnel drop-off points"
- "How do our app store ratings compare to competitors?"

### 3. Marketing Agent

**Team**: Marketing Team

**Data Sources**:
- Google Ads API
- Meta Ads API
- LinkedIn Ads API
- TikTok Ads API

**Capabilities**:
- Analyze campaign performance
- Calculate ROI and ROAS
- Identify best-performing ad creatives
- Monitor budget utilization
- Provide optimization recommendations

**Example Queries**:
- "What's our overall ROAS this month?"
- "Which ad campaigns are underperforming?"
- "Show me cost per acquisition by channel"
- "Compare creative performance across platforms"

### 4. Growth Agent

**Team**: Growth Team

**Data Sources**:
- Google Analytics 4
- Google Search Console
- Social media APIs (Twitter, LinkedIn, etc.)

**Capabilities**:
- Track organic traffic and conversions
- Monitor SEO performance
- Analyze social media engagement
- Identify viral content
- Measure content performance

**Example Queries**:
- "What's our organic traffic trend?"
- "Which blog posts drive the most conversions?"
- "Show me our search engine rankings"
- "What content is getting the most social shares?"

### 5. Research Agent

**Team**: All teams

**Data Sources**:
- Web search
- Web scraping
- Public APIs
- Industry databases

**Capabilities**:
- Market research
- Competitor analysis
- Industry trend analysis
- Data gathering from public sources

**Example Queries**:
- "Research our top 5 competitors"
- "What are the latest trends in our industry?"
- "Find pricing strategies of similar products"
- "Summarize recent news about our market"

## Data Flow

### User Query → Response Flow

1. **User sends message** via chat interface
2. **Next.js API route** (`/api/chat`) receives request
3. **Coordinator Agent** analyzes the query
4. **Permission check**: Verify user's team permissions
5. **Agent selection**: Determine which agent(s) to invoke
6. **Agent execution**:
   - Specialized agent(s) fetch data via MCP tools
   - Process and analyze the data
   - Generate insights, charts, or reports
7. **Result synthesis**: Coordinator combines multi-agent results
8. **Streaming response**: Send back to frontend in real-time
9. **Visualization**: Frontend renders charts/reports
10. **Store in DB**: Save chat history and session data

### Example Multi-Agent Query

**User**: "Give me a complete business overview for this month"

**Flow**:
1. Coordinator Agent receives query
2. Delegates to ALL agents in parallel:
   - Product Agent → Mixpanel, App Store data
   - Marketing Agent → Ads performance data
   - Growth Agent → Organic traffic data
   - Research Agent → Industry trends
3. Each agent returns structured data
4. Coordinator synthesizes into comprehensive report:
   ```
   📊 Business Overview - January 2026

   📱 Product Metrics:
   - 50K active users (+15% MoM)
   - 7-day retention: 42%
   - App Store rating: 4.7/5

   💰 Marketing Performance:
   - Ad spend: $50K
   - ROAS: 3.2x
   - CPA: $12.50

   🌱 Growth Metrics:
   - Organic traffic: 125K visits (+22%)
   - Blog conversions: 2,500
   - Top content: "AI in Business" guide

   🔍 Market Insights:
   - Industry growing 35% YoY
   - 3 new competitors launched
   - AI automation trending
   ```

## Team-Based Permissions

Teams have access to specific agents based on their role:

| Team | Agents | Rationale |
|------|--------|-----------|
| **Business Team** | All agents | Strategic oversight, needs full picture |
| **Product Team** | Product, Research | Focus on product analytics and user behavior |
| **Marketing Team** | Marketing, Research | Focus on ad performance and campaigns |
| **Growth Team** | Growth, Research | Focus on organic channels and content |
| **Executive Team** | All agents | C-level dashboard and reporting |

Implementation in code:
```typescript
const teamPermissions = {
  business: ['product', 'marketing', 'growth', 'research'],
  product: ['product', 'research'],
  marketing: ['marketing', 'research'],
  growth: ['growth', 'research'],
  executive: ['product', 'marketing', 'growth', 'research'],
};
```

## Database Schema

### Tables

#### `users`
- `id` - Primary key
- `email` - User email
- `name` - User name
- `team` - Team assignment (business, product, marketing, growth, executive)
- `created_at` - Timestamp

#### `sessions`
- `id` - Session ID (from Agent SDK)
- `user_id` - Foreign key to users
- `created_at` - Session start time
- `updated_at` - Last message time
- `title` - Auto-generated session title

#### `messages`
- `id` - Primary key
- `session_id` - Foreign key to sessions
- `role` - 'user' | 'assistant' | 'system'
- `content` - Message content
- `agent_id` - Which agent generated (if assistant)
- `metadata` - JSON (charts, visualizations, etc.)
- `created_at` - Timestamp

#### `api_credentials`
- `id` - Primary key
- `user_id` - Foreign key to users
- `service` - 'mixpanel' | 'google_analytics' | 'app_store' | etc.
- `credentials` - Encrypted JSON
- `created_at` - Timestamp

## MCP Server Implementation

Each external API gets its own MCP server that provides tools to the agents.

### Example: Mixpanel MCP Server

```typescript
// lib/mcp/mixpanel.ts
export const mixpanelMCP = {
  name: "mixpanel",
  tools: [
    {
      name: "get_active_users",
      description: "Get active users count for a date range",
      inputSchema: {
        type: "object",
        properties: {
          from_date: { type: "string", format: "date" },
          to_date: { type: "string", format: "date" },
          event: { type: "string" }
        },
        required: ["from_date", "to_date"]
      },
      execute: async (input) => {
        // Call Mixpanel API
        const response = await fetch(`https://mixpanel.com/api/2.0/engage`, {
          headers: { 'Authorization': `Bearer ${MIXPANEL_API_KEY}` },
          // ... query params
        });
        return response.json();
      }
    },
    {
      name: "get_funnel",
      description: "Analyze conversion funnel",
      // ... similar structure
    },
    // ... more tools
  ]
};
```

## Visualization Strategy

The system generates various visualizations based on the data:

### Chart Types

1. **Time Series Charts**: Traffic, revenue, engagement over time
2. **Bar Charts**: Comparisons (channel performance, feature adoption)
3. **Pie Charts**: Distribution (traffic sources, user segments)
4. **Funnel Charts**: Conversion funnels
5. **Tables**: Detailed data breakdowns

### Implementation

Agents return structured data with visualization hints:

```typescript
{
  type: "chart",
  chartType: "line",
  title: "Active Users - Last 30 Days",
  data: [
    { date: "2026-01-01", value: 1200 },
    { date: "2026-01-02", value: 1350 },
    // ...
  ],
  xAxis: "date",
  yAxis: "value"
}
```

Frontend renders using Recharts library.

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Shadcn/ui** - UI components

### Backend
- **Next.js API Routes** - REST API endpoints
- **Claude Agent SDK** - AI agents
- **SQLite (better-sqlite3)** - Database
- **Zod** - Schema validation

### External Integrations
- **Mixpanel API**
- **Google Analytics 4**
- **App Store Connect API**
- **Google Sheets API**
- **Google Ads API**
- **Meta Ads API**

## Security Considerations

1. **API Keys**: Store encrypted in database, never in code
2. **Team Permissions**: Enforce at API route level
3. **Rate Limiting**: Prevent abuse
4. **Input Validation**: Sanitize all user inputs
5. **HTTPS Only**: Enforce secure connections
6. **Environment Variables**: Use `.env.local` for secrets

## Next Steps

1. **Free up disk space** (500MB-1GB minimum)
2. **Install dependencies** (Next.js, React, Agent SDK)
3. **Set up database** (SQLite schema and migrations)
4. **Implement coordinator agent**
5. **Create specialized agents**
6. **Build MCP servers** for each API
7. **Develop chat UI**
8. **Add data visualization**
9. **Implement authentication**
10. **Deploy to production** (Vercel recommended)

## References

- [Claude Agent SDK Documentation](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Recharts Documentation](https://recharts.org/)
