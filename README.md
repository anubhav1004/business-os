# Business OS

An AI-powered business intelligence platform for ZUAI. Built with Next.js, Qwen LLM (via MuleRouter), and an agentic tool-calling system.

## Features

### Agentic AI System
- **Qwen3-max** LLM via MuleRouter API (OpenAI-compatible)
- **Multi-turn tool calling** with visible reasoning
- **9 specialized tools** for analytics and UGC tracking
- **Streaming responses** with real-time tool execution display

### Data Integrations
- **Mixpanel Analytics**: Product metrics, signups, conversions, user behavior
- **TikTok UGC Tracking**: Creator performance, video views, engagement (via SideShift)

### Chat Interface
- Real-time streaming with SSE
- Tool calls visible during execution
- Structured responses (TL;DR, Key Numbers, Insight, Recommendation)
- Session management

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```bash
# MuleRouter (Qwen)
MULEROUTER_API_KEY=sk-mr-your-key-here
MULEROUTER_BASE_URL=https://api.mulerouter.ai/vendors/openai/v1
MULEROUTER_MODEL=qwen3-max

# Mixpanel (for data refresh)
MIXPANEL_PROJECT_ID=your-project-id
MIXPANEL_API_SECRET=your-api-secret
```

## Available Tools

### Mixpanel Analytics (Product Metrics)
| Tool | Description |
|------|-------------|
| `get_business_summary` | Overview of all product metrics |
| `get_metric_data` | Detailed data for a specific event |
| `get_daily_trend` | Day-over-day changes |
| `calculate_conversion` | Funnel conversion rate |
| `compare_periods` | Compare metrics between time periods |

### TikTok UGC Tracking
| Tool | Description |
|------|-------------|
| `get_ugc_summary` | Overview of UGC performance |
| `get_top_videos` | Top performing videos by views |
| `get_creator_stats` | Statistics per creator |
| `get_ugc_by_date` | Videos filtered by date |

## Example Queries

**Product Analytics:**
- "What were signups yesterday?"
- "Show me the signup trend for the last 7 days"
- "What's our signup to subscription conversion rate?"

**UGC Analytics:**
- "Which TikTok video got the most views?"
- "Who is our top performing creator?"
- "Give me a UGC summary"

## Data Refresh

```bash
# Refresh UGC data from SideShift
npx tsx scripts/scrape-ugc.ts
```

## Architecture

```
User Query → Chat API → Qwen Agent (MuleRouter)
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
              Tool Calling         Final Response
                    ↓                   ↓
            ┌───────┼───────┐     Structured Output
            ↓       ↓       ↓     (TL;DR, Numbers,
         Mixpanel  UGC   More      Insight, Rec)
          Tools   Tools  Tools
```

## Project Structure

```
business-os/
├── app/
│   ├── api/chat/route.ts    # Chat API with streaming
│   └── page.tsx             # Main chat interface
├── components/
│   └── chat/                # Chat UI components
├── lib/
│   ├── ai/
│   │   └── agent.ts         # Qwen agent with tools
│   ├── db/
│   │   └── client.ts        # SQLite for sessions
│   └── types/
│       └── chat.ts          # Type definitions
├── scripts/
│   └── scrape-ugc.ts        # Playwright UGC scraper
├── data/
│   ├── mixpanel-data.json   # Scraped Mixpanel data
│   └── ugc-data.json        # Scraped UGC data
└── .claude/
    └── skills/
        └── business-ai.md   # Skill definition
```

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **LLM**: Qwen3-max via MuleRouter
- **Database**: SQLite (better-sqlite3)
- **Scraping**: Playwright
- **Streaming**: Server-Sent Events (SSE)

## Deployment

### Vercel (Recommended)

```bash
vercel
```

Note: Set environment variables in Vercel dashboard.

## License

ISC
