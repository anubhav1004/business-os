# Mixpanel Integration

This document describes the Mixpanel analytics integration in Business OS.

## Overview

Business OS integrates with Mixpanel to provide product analytics data. The integration scrapes data from the Mixpanel API and stores it locally for fast access by the AI agent.

## Data Structure

The scraped data is stored in `data/mixpanel-data.json`:

```json
{
  "project_id": "2778692",
  "date_range": {
    "start": "2026-01-01",
    "end": "2026-01-30"
  },
  "scraped_at": "2026-01-30T...",
  "summary": {
    "total_signups_30d": 9807,
    "total_dashboard_views_30d": 40093,
    "total_chat_messages_30d": 27166,
    "total_subscription_orders_30d": 13074,
    "avg_daily_signups": 327
  },
  "events": {
    "signup_completed": { "2026-01-01": 245, ... },
    "dashboard_viewed": { "2026-01-01": 1203, ... },
    "chat_messages": { "2026-01-01": 892, ... },
    "subscription_order_initiated": { "2026-01-01": 412, ... }
  }
}
```

## Available Tools

### get_business_summary

Returns an overview of all available metrics.

```typescript
// Usage
const result = executeTool('get_business_summary', {});

// Returns
{
  project_id: "2778692",
  date_range: { start: "2026-01-01", end: "2026-01-30" },
  summary: { ... },
  available_metrics: ["signup_completed", "dashboard_viewed", ...]
}
```

### get_metric_data

Returns detailed daily data for a specific event.

```typescript
// Usage
const result = executeTool('get_metric_data', {
  event_name: 'signup_completed',
  start_date: '2026-01-25',  // optional
  end_date: '2026-01-30'     // optional
});

// Returns
{
  event: "signup_completed",
  data: { "2026-01-25": 412, "2026-01-26": 389, ... },
  stats: {
    total: 2345,
    average: 390,
    max: 610,
    min: 245,
    days: 6
  }
}
```

### get_daily_trend

Returns day-over-day changes for a metric.

```typescript
// Usage
const result = executeTool('get_daily_trend', {
  event_name: 'signup_completed',
  days: 7  // optional, default: 7
});

// Returns
{
  event: "signup_completed",
  days: 7,
  trend: [
    { date: "2026-01-24", value: 312 },
    { date: "2026-01-25", value: 412, change: 100, change_percent: "+32.1%" },
    ...
  ]
}
```

### calculate_conversion

Calculates funnel conversion rate between two events.

```typescript
// Usage
const result = executeTool('calculate_conversion', {
  start_event: 'signup_completed',
  end_event: 'subscription_order_initiated'
});

// Returns
{
  funnel: "signup_completed -> subscription_order_initiated",
  start_event: { name: "signup_completed", total: 9807 },
  end_event: { name: "subscription_order_initiated", total: 13074 },
  conversion_rate: "133.32%",
  drop_off: "-33.32%"
}
```

### compare_periods

Compares a metric between two time periods.

```typescript
// Usage
const result = executeTool('compare_periods', {
  event_name: 'signup_completed',
  period1_start: '2026-01-22',
  period1_end: '2026-01-28',
  period2_start: '2026-01-15',
  period2_end: '2026-01-21'
});

// Returns
{
  event: "signup_completed",
  period1: { range: "2026-01-22 to 2026-01-28", total: 2890 },
  period2: { range: "2026-01-15 to 2026-01-21", total: 2456 },
  comparison: {
    absolute_change: 434,
    percent_change: "+17.7%",
    trend: "up"
  }
}
```

## Configuration

Set the following environment variables:

```bash
MIXPANEL_PROJECT_ID=your-project-id
MIXPANEL_API_SECRET=your-api-secret
```

## Data Refresh

To refresh the Mixpanel data:

```bash
# Run the Mixpanel scraper (if implemented)
npx tsx scripts/scrape-mixpanel.ts
```

Currently, the data is pre-scraped and stored in `data/mixpanel-data.json`.

## Events Tracked

| Event | Description |
|-------|-------------|
| `signup_completed` | User completed signup |
| `dashboard_viewed` | User viewed the dashboard |
| `chat_messages` | Chat messages sent |
| `subscription_order_initiated` | User initiated subscription |
| `subscription_page_viewed` | User viewed subscription page |

## Example Queries

The AI agent can answer questions like:

- "What were signups yesterday?"
- "Show me the signup trend for the last 7 days"
- "What's our signup to subscription conversion rate?"
- "Compare signups this week vs last week"
- "Give me a full business summary"
