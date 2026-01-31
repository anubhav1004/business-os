/**
 * Business AI Agent - TypeScript Implementation
 *
 * Agentic system with tool calling for the Next.js web interface.
 */

import OpenAI from 'openai';
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// ============= CONFIGURATION =============

const MULEROUTER_API_KEY = process.env.MULEROUTER_API_KEY || '';
const MULEROUTER_BASE_URL = process.env.MULEROUTER_BASE_URL || 'https://api.mulerouter.ai/vendors/openai/v1';
const MODEL_NAME = process.env.MULEROUTER_MODEL || 'qwen3-max';
const MAX_ITERATIONS = 10;

// Create OpenAI client for MuleRouter
const client = new OpenAI({
  apiKey: MULEROUTER_API_KEY,
  baseURL: MULEROUTER_BASE_URL,
});

// ============= DATA LOADING =============

function loadMixpanelData(): any {
  try {
    const dataPath = join(process.cwd(), 'data', 'mixpanel-data.json');
    if (existsSync(dataPath)) {
      return JSON.parse(readFileSync(dataPath, 'utf-8'));
    }
  } catch (error) {
    console.error('Error loading Mixpanel data:', error);
  }
  return null;
}

function loadUGCData(): any {
  try {
    const dataPath = join(process.cwd(), 'data', 'ugc-data.json');
    if (existsSync(dataPath)) {
      return JSON.parse(readFileSync(dataPath, 'utf-8'));
    }
  } catch (error) {
    console.error('Error loading UGC data:', error);
  }
  return null;
}

// ============= TOOL DEFINITIONS =============

export const TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_business_summary',
      description: 'Get an overview of all available business metrics and KPIs. Use this FIRST to understand what data is available.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_metric_data',
      description: 'Get detailed daily data and statistics for a specific metric/event.',
      parameters: {
        type: 'object',
        properties: {
          event_name: {
            type: 'string',
            description: "Name of the event (e.g., 'signup_completed', 'dashboard_viewed')",
          },
          start_date: {
            type: 'string',
            description: 'Start date filter (YYYY-MM-DD)',
          },
          end_date: {
            type: 'string',
            description: 'End date filter (YYYY-MM-DD)',
          },
        },
        required: ['event_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_daily_trend',
      description: 'Get daily trend with day-over-day changes for a metric.',
      parameters: {
        type: 'object',
        properties: {
          event_name: {
            type: 'string',
            description: 'Name of the event/metric',
          },
          days: {
            type: 'number',
            description: 'Number of days to show (default: 7)',
          },
        },
        required: ['event_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_conversion',
      description: 'Calculate conversion rate between two events (funnel analysis).',
      parameters: {
        type: 'object',
        properties: {
          start_event: {
            type: 'string',
            description: 'Starting event in the funnel',
          },
          end_event: {
            type: 'string',
            description: 'Ending event in the funnel',
          },
        },
        required: ['start_event', 'end_event'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'compare_periods',
      description: 'Compare a metric between two time periods.',
      parameters: {
        type: 'object',
        properties: {
          event_name: { type: 'string', description: 'Event to compare' },
          period1_start: { type: 'string', description: 'Current period start (YYYY-MM-DD)' },
          period1_end: { type: 'string', description: 'Current period end (YYYY-MM-DD)' },
          period2_start: { type: 'string', description: 'Previous period start (YYYY-MM-DD)' },
          period2_end: { type: 'string', description: 'Previous period end (YYYY-MM-DD)' },
        },
        required: ['event_name', 'period1_start', 'period1_end', 'period2_start', 'period2_end'],
      },
    },
  },
  // ============= UGC TOOLS =============
  {
    type: 'function',
    function: {
      name: 'get_ugc_summary',
      description: 'Get an overview of TikTok UGC (User Generated Content) performance metrics including total views, engagement, likes, comments, shares, and number of posts.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_top_videos',
      description: 'Get top performing TikTok videos sorted by views. Returns video rank, views, creator handle, creator name, and post date.',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Number of top videos to return (default: 10)',
          },
          creator: {
            type: 'string',
            description: 'Filter by creator handle (e.g., @wenstudiess)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_creator_stats',
      description: 'Get statistics for each TikTok creator including their handle, name, post count, and total views.',
      parameters: {
        type: 'object',
        properties: {
          creator: {
            type: 'string',
            description: 'Optional: specific creator handle to get stats for',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_ugc_by_date',
      description: 'Get TikTok videos filtered by date or date range.',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: 'Specific date to filter (e.g., "Jan 25, 2026")',
          },
          start_date: {
            type: 'string',
            description: 'Start date for range filter',
          },
          end_date: {
            type: 'string',
            description: 'End date for range filter',
          },
        },
        required: [],
      },
    },
  },
];

// ============= TOOL IMPLEMENTATIONS =============

function findEvent(events: Record<string, any>, name: string): [string | null, any] {
  const eventKey = name.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
  for (const k of Object.keys(events)) {
    if (k.toLowerCase() === eventKey || eventKey.includes(k.toLowerCase()) || k.toLowerCase().includes(eventKey)) {
      return [k, events[k]];
    }
  }
  return [null, null];
}

function toolGetBusinessSummary(): string {
  const data = loadMixpanelData();
  if (!data) return JSON.stringify({ error: 'No Mixpanel data available' });

  return JSON.stringify({
    project_id: data.project_id,
    date_range: data.date_range,
    scraped_at: data.scraped_at,
    summary: data.summary,
    available_metrics: Object.keys(data.events || {}),
  }, null, 2);
}

function toolGetMetricData(args: { event_name: string; start_date?: string; end_date?: string }): string {
  const data = loadMixpanelData();
  if (!data) return JSON.stringify({ error: 'No Mixpanel data available' });

  const events = data.events || {};
  const [matchingKey, eventData] = findEvent(events, args.event_name);

  if (!matchingKey) {
    return JSON.stringify({
      error: `Event '${args.event_name}' not found`,
      available_events: Object.keys(events),
    });
  }

  let filteredData = eventData;
  if (args.start_date || args.end_date) {
    filteredData = {};
    for (const [date, value] of Object.entries(eventData)) {
      if ((!args.start_date || date >= args.start_date) && (!args.end_date || date <= args.end_date)) {
        filteredData[date] = value;
      }
    }
  }

  const values = Object.values(filteredData) as number[];
  const total = values.reduce((a, b) => a + b, 0);

  return JSON.stringify({
    event: matchingKey,
    data: filteredData,
    stats: {
      total,
      average: values.length > 0 ? Math.round(total / values.length) : 0,
      max: values.length > 0 ? Math.max(...values) : 0,
      min: values.length > 0 ? Math.min(...values) : 0,
      days: values.length,
    },
  }, null, 2);
}

function toolGetDailyTrend(args: { event_name: string; days?: number }): string {
  const data = loadMixpanelData();
  if (!data) return JSON.stringify({ error: 'No Mixpanel data available' });

  const events = data.events || {};
  const [matchingKey, eventData] = findEvent(events, args.event_name);

  if (!matchingKey) {
    return JSON.stringify({ error: `Event '${args.event_name}' not found` });
  }

  const days = args.days || 7;
  const dates = Object.keys(eventData).sort().slice(-days);
  const trend = dates.map((date, i) => {
    const value = eventData[date];
    const entry: any = { date, value };

    if (i > 0) {
      const prev = eventData[dates[i - 1]];
      const change = value - prev;
      const changePct = prev > 0 ? ((change / prev) * 100).toFixed(1) : '0';
      entry.change = change;
      entry.change_percent = `${change >= 0 ? '+' : ''}${changePct}%`;
    }

    return entry;
  });

  return JSON.stringify({ event: matchingKey, days, trend }, null, 2);
}

function toolCalculateConversion(args: { start_event: string; end_event: string }): string {
  const data = loadMixpanelData();
  if (!data) return JSON.stringify({ error: 'No Mixpanel data available' });

  const events = data.events || {};
  const [startKey, startData] = findEvent(events, args.start_event);
  const [endKey, endData] = findEvent(events, args.end_event);

  if (!startKey) return JSON.stringify({ error: `Start event '${args.start_event}' not found` });
  if (!endKey) return JSON.stringify({ error: `End event '${args.end_event}' not found` });

  const startTotal = Object.values(startData as Record<string, number>).reduce((a, b) => a + b, 0);
  const endTotal = Object.values(endData as Record<string, number>).reduce((a, b) => a + b, 0);
  const conversion = startTotal > 0 ? ((endTotal / startTotal) * 100).toFixed(2) : '0';

  return JSON.stringify({
    funnel: `${startKey} -> ${endKey}`,
    start_event: { name: startKey, total: startTotal },
    end_event: { name: endKey, total: endTotal },
    conversion_rate: `${conversion}%`,
    drop_off: `${(100 - parseFloat(conversion)).toFixed(2)}%`,
  }, null, 2);
}

function toolComparePeriods(args: {
  event_name: string;
  period1_start: string;
  period1_end: string;
  period2_start: string;
  period2_end: string;
}): string {
  const data = loadMixpanelData();
  if (!data) return JSON.stringify({ error: 'No Mixpanel data available' });

  const events = data.events || {};
  const [matchingKey, eventData] = findEvent(events, args.event_name);

  if (!matchingKey) return JSON.stringify({ error: `Event '${args.event_name}' not found` });

  const periodTotal = (start: string, end: string) => {
    return Object.entries(eventData as Record<string, number>)
      .filter(([d]) => d >= start && d <= end)
      .reduce((sum, [, v]) => sum + v, 0);
  };

  const p1Total = periodTotal(args.period1_start, args.period1_end);
  const p2Total = periodTotal(args.period2_start, args.period2_end);
  const change = p1Total - p2Total;
  const changePct = p2Total > 0 ? ((change / p2Total) * 100).toFixed(1) : '0';

  return JSON.stringify({
    event: matchingKey,
    period1: { range: `${args.period1_start} to ${args.period1_end}`, total: p1Total },
    period2: { range: `${args.period2_start} to ${args.period2_end}`, total: p2Total },
    comparison: {
      absolute_change: change,
      percent_change: `${change >= 0 ? '+' : ''}${changePct}%`,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
    },
  }, null, 2);
}

// ============= UGC TOOL IMPLEMENTATIONS =============

function toolGetUGCSummary(): string {
  const data = loadUGCData();
  if (!data) return JSON.stringify({ error: 'No UGC data available. Run the scraper first.' });

  return JSON.stringify({
    platform: 'TikTok',
    scraped_at: data.scrapedAt,
    total_posts: data.summary.totalPosts,
    metrics: {
      views: data.summary.totalViewsFormatted,
      views_raw: data.summary.totalViews,
      engagement: data.summary.totalEngagementFormatted,
      engagement_raw: data.summary.totalEngagement,
      likes: data.summary.totalLikesFormatted,
      likes_raw: data.summary.totalLikes,
      comments: data.summary.totalComments,
      shares: data.summary.totalShares,
    },
    creators_count: data.creators?.length || 0,
    top_creator: data.creators?.[0] || null,
  }, null, 2);
}

function toolGetTopVideos(args: { limit?: number; creator?: string }): string {
  const data = loadUGCData();
  if (!data) return JSON.stringify({ error: 'No UGC data available' });

  let videos = data.videos || [];

  // Filter by creator if specified
  if (args.creator) {
    const creatorHandle = args.creator.startsWith('@') ? args.creator : `@${args.creator}`;
    videos = videos.filter((v: any) =>
      v.creatorHandle.toLowerCase() === creatorHandle.toLowerCase()
    );
  }

  // Limit results
  const limit = args.limit || 10;
  videos = videos.slice(0, limit);

  return JSON.stringify({
    count: videos.length,
    filter: args.creator ? `creator: ${args.creator}` : 'all creators',
    videos: videos.map((v: any) => ({
      rank: v.rank,
      views: v.viewsFormatted,
      views_raw: v.views,
      creator: v.creatorHandle,
      creator_name: v.creatorName,
      posted: v.postedAt,
    })),
  }, null, 2);
}

function toolGetCreatorStats(args: { creator?: string }): string {
  const data = loadUGCData();
  if (!data) return JSON.stringify({ error: 'No UGC data available' });

  let creators = data.creators || [];

  // Filter by specific creator if requested
  if (args.creator) {
    const creatorHandle = args.creator.startsWith('@') ? args.creator : `@${args.creator}`;
    creators = creators.filter((c: any) =>
      c.handle.toLowerCase() === creatorHandle.toLowerCase()
    );
  }

  // Calculate additional metrics
  const creatorsWithMetrics = creators.map((c: any) => ({
    handle: c.handle,
    name: c.name,
    post_count: c.postCount,
    total_views: c.totalViews,
    avg_views_per_post: Math.round(c.totalViews / c.postCount),
    views_formatted: c.totalViews >= 1000000
      ? `${(c.totalViews / 1000000).toFixed(1)}M`
      : c.totalViews >= 1000
        ? `${(c.totalViews / 1000).toFixed(1)}K`
        : c.totalViews.toString(),
  }));

  return JSON.stringify({
    creator_count: creatorsWithMetrics.length,
    creators: creatorsWithMetrics,
    best_performer: creatorsWithMetrics[0] || null,
  }, null, 2);
}

function toolGetUGCByDate(args: { date?: string; start_date?: string; end_date?: string }): string {
  const data = loadUGCData();
  if (!data) return JSON.stringify({ error: 'No UGC data available' });

  let videos = data.videos || [];

  if (args.date) {
    videos = videos.filter((v: any) =>
      v.postedAt.toLowerCase().includes(args.date!.toLowerCase())
    );
  } else if (args.start_date || args.end_date) {
    // Simple date filtering - assumes format like "Jan 25, 2026"
    videos = videos.filter((v: any) => {
      const postDate = v.postedAt;
      if (args.start_date && postDate < args.start_date) return false;
      if (args.end_date && postDate > args.end_date) return false;
      return true;
    });
  }

  const totalViews = videos.reduce((sum: number, v: any) => sum + v.views, 0);

  return JSON.stringify({
    filter: args.date || `${args.start_date || 'start'} to ${args.end_date || 'end'}`,
    count: videos.length,
    total_views: totalViews,
    videos: videos.map((v: any) => ({
      rank: v.rank,
      views: v.viewsFormatted,
      creator: v.creatorHandle,
      posted: v.postedAt,
    })),
  }, null, 2);
}

// Tool dispatcher
function executeTool(name: string, args: any): string {
  switch (name) {
    case 'get_business_summary':
      return toolGetBusinessSummary();
    case 'get_metric_data':
      return toolGetMetricData(args);
    case 'get_daily_trend':
      return toolGetDailyTrend(args);
    case 'calculate_conversion':
      return toolCalculateConversion(args);
    case 'compare_periods':
      return toolComparePeriods(args);
    // UGC Tools
    case 'get_ugc_summary':
      return toolGetUGCSummary();
    case 'get_top_videos':
      return toolGetTopVideos(args);
    case 'get_creator_stats':
      return toolGetCreatorStats(args);
    case 'get_ugc_by_date':
      return toolGetUGCByDate(args);
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

// ============= SYSTEM PROMPT =============

const SYSTEM_PROMPT = `You are the **Business AI Coordinator** for ZUAI (Scan & Learn), an AI education app.

## Your Role
You are an AI Chief of Staff providing business intelligence. You have access to Mixpanel analytics data AND TikTok UGC (User Generated Content) tracking data. MUST use your tools to answer questions with real data.

## IMPORTANT: Always Use Tools
- NEVER make up numbers or guess data
- ALWAYS call tools to get real data before answering
- For product/business metrics: use Mixpanel tools (get_business_summary, etc.)
- For TikTok/UGC/creator questions: use UGC tools (get_ugc_summary, get_top_videos, etc.)
- Use multiple tools if needed to fully answer the question

## Available Tools

### Mixpanel Analytics (Product Metrics)
1. **get_business_summary** - Overview of all product metrics (use first for product questions!)
2. **get_metric_data** - Detailed data for a specific event
3. **get_daily_trend** - Day-over-day changes
4. **calculate_conversion** - Funnel conversion between events
5. **compare_periods** - Compare metrics between time periods

### TikTok UGC Tracking (Creator Content)
6. **get_ugc_summary** - Overview of TikTok UGC performance (views, engagement, likes, comments, shares)
7. **get_top_videos** - Top performing videos by views, optionally filter by creator
8. **get_creator_stats** - Statistics per creator (post count, total views, avg views)
9. **get_ugc_by_date** - Filter videos by date or date range

## Business Context
- **Product**: ZUAI - Mobile app where students scan homework problems, AI explains step-by-step
- **Model**: Freemium with subscription
- **Key Events**: signup_completed, dashboard_viewed, chat_messages, subscription_order_initiated
- **UGC Program**: TikTok creators posting organic content about ZUAI

## Response Format
After gathering data with tools, provide:
1. **TL;DR** - One sentence answer
2. **Key Numbers** - The specific metrics
3. **Insight** - What it means
4. **Recommendation** - What to do (if applicable)

Current date: ${new Date().toISOString().split('T')[0]}
`;

// ============= AGENT EVENT TYPES =============

export interface AgentEvent {
  type: 'thinking' | 'tool_call' | 'tool_result' | 'text' | 'done' | 'error';
  content: any;
}

// ============= AGENT RUNNER =============

export async function* runAgent(
  userMessage: string,
  messageHistory: ChatCompletionMessageParam[] = []
): AsyncGenerator<AgentEvent> {
  // Build messages
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messageHistory,
    { role: 'user', content: userMessage },
  ];

  let iteration = 0;

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    yield { type: 'thinking', content: `Iteration ${iteration}: Processing...` };

    try {
      const response = await client.chat.completions.create({
        model: MODEL_NAME,
        messages,
        tools: TOOLS,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 4096,
      });

      const choice = response.choices[0];
      const message = choice.message;

      // Check for tool calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        // Add assistant message with tool calls
        messages.push({
          role: 'assistant',
          content: message.content || '',
          tool_calls: message.tool_calls,
        } as any);

        // Execute each tool
        for (const toolCall of message.tool_calls) {
          const toolName = toolCall.function.name;
          let toolArgs = {};
          try {
            toolArgs = JSON.parse(toolCall.function.arguments);
          } catch {
            toolArgs = {};
          }

          yield {
            type: 'tool_call',
            content: { id: toolCall.id, name: toolName, args: toolArgs },
          };

          const toolResult = executeTool(toolName, toolArgs);

          yield {
            type: 'tool_result',
            content: { id: toolCall.id, name: toolName, result: toolResult },
          };

          // Add tool result to messages
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: toolResult,
          } as any);
        }

        // Continue loop to get next response
        continue;
      }

      // No tool calls - final response
      if (message.content) {
        yield { type: 'text', content: message.content };
      }

      yield { type: 'done', content: { iterations: iteration } };
      break;

    } catch (error) {
      yield {
        type: 'error',
        content: error instanceof Error ? error.message : 'Unknown error',
      };
      break;
    }
  }
}
