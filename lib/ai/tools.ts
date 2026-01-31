/**
 * Business AI Tools
 *
 * Tool definitions for the agentic system.
 * Uses OpenAI-compatible function calling format.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Tool definition type (OpenAI format)
export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

// Tool result type
export interface ToolResult {
  tool_call_id: string;
  output: string;
  error?: boolean;
}

/**
 * Load Mixpanel data from file
 */
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

/**
 * Get metric data for a specific event
 */
function getMetricData(eventName: string, startDate?: string, endDate?: string): any {
  const data = loadMixpanelData();
  if (!data) return { error: 'No Mixpanel data available' };

  const eventKey = eventName.toLowerCase().replace(/\s+/g, '_');
  const events = data.events || {};

  // Try to find matching event
  const matchingKey = Object.keys(events).find(k =>
    k.toLowerCase().includes(eventKey) || eventKey.includes(k.toLowerCase())
  );

  if (!matchingKey) {
    return {
      error: `Event '${eventName}' not found`,
      available_events: Object.keys(events)
    };
  }

  const eventData = events[matchingKey];

  // Filter by date range if provided
  let filteredData = eventData;
  if (startDate || endDate) {
    filteredData = {};
    for (const [date, value] of Object.entries(eventData)) {
      if ((!startDate || date >= startDate) && (!endDate || date <= endDate)) {
        filteredData[date] = value;
      }
    }
  }

  // Calculate stats
  const values = Object.values(filteredData) as number[];
  const total = values.reduce((a, b) => a + b, 0);
  const avg = values.length > 0 ? total / values.length : 0;
  const max = Math.max(...values);
  const min = Math.min(...values);

  return {
    event: matchingKey,
    data: filteredData,
    stats: {
      total,
      average: Math.round(avg),
      max,
      min,
      days: values.length
    }
  };
}

/**
 * Compare two time periods
 */
function comparePeriods(eventName: string, period1Start: string, period1End: string, period2Start: string, period2End: string): any {
  const period1 = getMetricData(eventName, period1Start, period1End);
  const period2 = getMetricData(eventName, period2Start, period2End);

  if (period1.error) return period1;
  if (period2.error) return period2;

  const change = period1.stats.total - period2.stats.total;
  const changePercent = period2.stats.total > 0
    ? ((change / period2.stats.total) * 100).toFixed(1)
    : 'N/A';

  return {
    event: eventName,
    period1: {
      range: `${period1Start} to ${period1End}`,
      total: period1.stats.total,
      average: period1.stats.average
    },
    period2: {
      range: `${period2Start} to ${period2End}`,
      total: period2.stats.total,
      average: period2.stats.average
    },
    comparison: {
      absolute_change: change,
      percent_change: `${changePercent}%`,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
    }
  };
}

/**
 * Calculate conversion rate between two events
 */
function calculateConversion(startEvent: string, endEvent: string, startDate?: string, endDate?: string): any {
  const startData = getMetricData(startEvent, startDate, endDate);
  const endData = getMetricData(endEvent, startDate, endDate);

  if (startData.error) return startData;
  if (endData.error) return endData;

  const conversionRate = startData.stats.total > 0
    ? ((endData.stats.total / startData.stats.total) * 100).toFixed(2)
    : '0';

  return {
    funnel: `${startEvent} → ${endEvent}`,
    start_event: {
      name: startData.event,
      total: startData.stats.total
    },
    end_event: {
      name: endData.event,
      total: endData.stats.total
    },
    conversion_rate: `${conversionRate}%`,
    drop_off: `${(100 - parseFloat(conversionRate)).toFixed(2)}%`
  };
}

/**
 * Get business summary
 */
function getBusinessSummary(): any {
  const data = loadMixpanelData();
  if (!data) return { error: 'No Mixpanel data available' };

  return {
    project_id: data.project_id,
    date_range: data.date_range,
    scraped_at: data.scraped_at,
    summary: data.summary,
    available_metrics: Object.keys(data.events || {})
  };
}

/**
 * Get daily trend for an event
 */
function getDailyTrend(eventName: string, days: number = 7): any {
  const data = getMetricData(eventName);
  if (data.error) return data;

  const dates = Object.keys(data.data).sort().slice(-days);
  const trend = dates.map(date => ({
    date,
    value: data.data[date]
  }));

  // Calculate day-over-day changes
  const withChanges = trend.map((item, i) => {
    if (i === 0) return { ...item, change: null, change_percent: null };
    const prev = trend[i - 1].value;
    const change = item.value - prev;
    const changePercent = prev > 0 ? ((change / prev) * 100).toFixed(1) : 'N/A';
    return {
      ...item,
      change,
      change_percent: `${changePercent}%`
    };
  });

  return {
    event: data.event,
    days: days,
    trend: withChanges,
    overall_stats: data.stats
  };
}

// ============= TOOL DEFINITIONS =============

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'get_business_summary',
      description: 'Get an overview of all available business metrics and data. Use this first to understand what data is available.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_metric_data',
      description: 'Get detailed data for a specific metric/event. Returns daily values and statistics.',
      parameters: {
        type: 'object',
        properties: {
          event_name: {
            type: 'string',
            description: 'Name of the event/metric (e.g., "signups", "dashboard_viewed", "subscription_orders")'
          },
          start_date: {
            type: 'string',
            description: 'Start date in YYYY-MM-DD format (optional)'
          },
          end_date: {
            type: 'string',
            description: 'End date in YYYY-MM-DD format (optional)'
          }
        },
        required: ['event_name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_daily_trend',
      description: 'Get daily trend with day-over-day changes for a metric. Good for understanding recent patterns.',
      parameters: {
        type: 'object',
        properties: {
          event_name: {
            type: 'string',
            description: 'Name of the event/metric'
          },
          days: {
            type: 'number',
            description: 'Number of days to show (default: 7)'
          }
        },
        required: ['event_name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'compare_periods',
      description: 'Compare metrics between two time periods. Useful for week-over-week or month-over-month analysis.',
      parameters: {
        type: 'object',
        properties: {
          event_name: {
            type: 'string',
            description: 'Name of the event/metric to compare'
          },
          period1_start: {
            type: 'string',
            description: 'Start date of first period (YYYY-MM-DD)'
          },
          period1_end: {
            type: 'string',
            description: 'End date of first period (YYYY-MM-DD)'
          },
          period2_start: {
            type: 'string',
            description: 'Start date of second period (YYYY-MM-DD)'
          },
          period2_end: {
            type: 'string',
            description: 'End date of second period (YYYY-MM-DD)'
          }
        },
        required: ['event_name', 'period1_start', 'period1_end', 'period2_start', 'period2_end']
      }
    }
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
            description: 'The starting event in the funnel (e.g., "welcome_screen_viewed")'
          },
          end_event: {
            type: 'string',
            description: 'The ending event in the funnel (e.g., "signup_completed")'
          },
          start_date: {
            type: 'string',
            description: 'Start date filter (YYYY-MM-DD, optional)'
          },
          end_date: {
            type: 'string',
            description: 'End date filter (YYYY-MM-DD, optional)'
          }
        },
        required: ['start_event', 'end_event']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'think',
      description: 'Use this tool to think through complex problems step by step. Write out your reasoning process.',
      parameters: {
        type: 'object',
        properties: {
          thought: {
            type: 'string',
            description: 'Your reasoning or thought process'
          }
        },
        required: ['thought']
      }
    }
  }
];

// ============= TOOL EXECUTION =============

export function executeTool(name: string, args: Record<string, any>): string {
  try {
    switch (name) {
      case 'get_business_summary':
        return JSON.stringify(getBusinessSummary(), null, 2);

      case 'get_metric_data':
        return JSON.stringify(
          getMetricData(args.event_name, args.start_date, args.end_date),
          null,
          2
        );

      case 'get_daily_trend':
        return JSON.stringify(
          getDailyTrend(args.event_name, args.days || 7),
          null,
          2
        );

      case 'compare_periods':
        return JSON.stringify(
          comparePeriods(
            args.event_name,
            args.period1_start,
            args.period1_end,
            args.period2_start,
            args.period2_end
          ),
          null,
          2
        );

      case 'calculate_conversion':
        return JSON.stringify(
          calculateConversion(
            args.start_event,
            args.end_event,
            args.start_date,
            args.end_date
          ),
          null,
          2
        );

      case 'think':
        // Think tool just returns the thought - it's for reasoning
        return `Thinking: ${args.thought}`;

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (error) {
    return JSON.stringify({
      error: `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}
