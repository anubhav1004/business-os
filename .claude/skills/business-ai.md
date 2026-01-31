# Business AI - Analytics & UGC Skill

## Description
Business intelligence skill for ZUAI (Scan & Learn) that provides access to Mixpanel product analytics and TikTok UGC (User Generated Content) tracking data.

## When to Use
- User asks about signups, conversions, dashboard views, or product metrics
- User asks about TikTok videos, creators, views, engagement, or UGC performance
- User wants a business summary or CEO briefing
- User asks about trends, comparisons, or funnel analysis

## Available Tools

### Mixpanel Analytics (Product Metrics)

#### get_business_summary
Get an overview of all available business metrics and KPIs.
- **Use first** to understand what data is available
- Returns: project info, date range, summary stats, available metrics

#### get_metric_data
Get detailed daily data for a specific metric/event.
- Parameters:
  - `event_name` (required): e.g., 'signup_completed', 'dashboard_viewed'
  - `start_date` (optional): YYYY-MM-DD format
  - `end_date` (optional): YYYY-MM-DD format
- Returns: daily data, total, average, max, min

#### get_daily_trend
Get day-over-day changes for a metric.
- Parameters:
  - `event_name` (required): Name of the event
  - `days` (optional): Number of days (default: 7)
- Returns: trend with daily values and % changes

#### calculate_conversion
Calculate funnel conversion rate between two events.
- Parameters:
  - `start_event` (required): Starting event in funnel
  - `end_event` (required): Ending event in funnel
- Returns: conversion rate, drop-off percentage

#### compare_periods
Compare a metric between two time periods.
- Parameters:
  - `event_name` (required): Event to compare
  - `period1_start`, `period1_end` (required): Current period
  - `period2_start`, `period2_end` (required): Previous period
- Returns: totals for each period, absolute and % change

### TikTok UGC Tracking (Creator Content)

#### get_ugc_summary
Get overview of TikTok UGC performance.
- Returns: total views, engagement, likes, comments, shares, post count, top creator

#### get_top_videos
Get top performing TikTok videos by views.
- Parameters:
  - `limit` (optional): Number of videos (default: 10)
  - `creator` (optional): Filter by creator handle (e.g., @wenstudiess)
- Returns: ranked list with views, creator, date

#### get_creator_stats
Get statistics for each TikTok creator.
- Parameters:
  - `creator` (optional): Specific creator handle
- Returns: post count, total views, avg views per post

#### get_ugc_by_date
Get TikTok videos filtered by date.
- Parameters:
  - `date` (optional): Specific date (e.g., "Jan 25, 2026")
  - `start_date`, `end_date` (optional): Date range
- Returns: filtered videos with metrics

## Response Format
After gathering data, respond with:
1. **TL;DR** - One sentence answer
2. **Key Numbers** - The specific metrics
3. **Insight** - What it means
4. **Recommendation** - What to do (if applicable)

## Example Queries

### Product Analytics
- "What were signups yesterday?"
- "Show me the signup trend for the last 7 days"
- "What's our signup to subscription conversion rate?"
- "Compare signups this week vs last week"
- "Give me a full business summary"

### UGC Analytics
- "Which TikTok video got the most views?"
- "Who is our top performing creator?"
- "Give me a UGC summary"
- "How did @wenstudiess perform?"
- "What videos were posted on Jan 25?"

## Technical Details
- **LLM**: Qwen3-max via MuleRouter API
- **API**: OpenAI-compatible function calling
- **Data Sources**:
  - Mixpanel (scraped to `data/mixpanel-data.json`)
  - SideShift UGC Tracker (scraped to `data/ugc-data.json`)

## Data Refresh
To refresh the data, run:
```bash
# Refresh UGC data from SideShift
npx tsx scripts/scrape-ugc.ts
```
