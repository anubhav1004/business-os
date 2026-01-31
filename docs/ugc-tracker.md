# UGC Tracker Integration

This document describes the TikTok UGC (User Generated Content) tracking integration in Business OS.

## Overview

Business OS integrates with SideShift to track TikTok creator content performance. A Playwright scraper extracts data from the SideShift analytics dashboard and stores it locally for the AI agent.

## Architecture

```
SideShift Dashboard (TikTok UGC)
    ↓
Playwright Scraper (scripts/scrape-ugc.ts)
    ↓
data/ugc-data.json
    ↓
UGC Tools (lib/ai/agent.ts)
    ↓
AI Agent Responses
```

## Data Structure

The scraped data is stored in `data/ugc-data.json`:

```json
{
  "shareId": "mVZoYYEfNLsrmweAnify",
  "scrapedAt": "2026-01-31T10:42:43.241Z",
  "summary": {
    "totalViews": 1100000,
    "totalViewsFormatted": "1.1M",
    "totalEngagement": 103500,
    "totalEngagementFormatted": "103.5K",
    "totalLikes": 103200,
    "totalLikesFormatted": "103.2K",
    "totalComments": 229,
    "totalShares": 33,
    "totalPosts": 31
  },
  "videos": [
    {
      "rank": 1,
      "views": 547000,
      "viewsFormatted": "547.0K",
      "creatorHandle": "@wenstudiess",
      "creatorName": "Kelby Palmer",
      "postedAt": "Jan 25, 2026",
      "platform": "tiktok"
    }
  ],
  "creators": [
    {
      "handle": "@wenstudiess",
      "name": "Kelby Palmer",
      "postCount": 6,
      "totalViews": 1087692
    }
  ]
}
```

## Playwright Scraper

The scraper uses Playwright to automate browser interaction:

```typescript
// scripts/scrape-ugc.ts
import { chromium } from 'playwright';

async function scrapeUGCDashboard() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(SHARE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000); // Wait for JS to render

  // Extract page text
  const pageText = await page.evaluate(() => document.body.innerText);

  // Parse summary metrics
  const summaryMatch = pageText.match(
    /Views\s+([\d.]+[KMB]?).*?Engagement\s+([\d.]+[KMB]?)/s
  );

  // Parse video entries (line-by-line)
  const lines = pageText.split('\n');
  // ... parsing logic

  await browser.close();
  return data;
}
```

### Running the Scraper

```bash
# Install Playwright
npm install playwright
npx playwright install chromium

# Run the scraper
npx tsx scripts/scrape-ugc.ts
```

Output:
```
Starting UGC Dashboard Scraper...
Launching browser...
Navigating to https://app.sideshift.app/share_analytics?shareID=...
Summary parsed: { totalViews: 1100000, ... }
Found 30 videos
Data saved to data/ugc-data.json
```

## Available Tools

### get_ugc_summary

Returns an overview of TikTok UGC performance.

```typescript
// Usage
const result = executeTool('get_ugc_summary', {});

// Returns
{
  platform: "TikTok",
  scraped_at: "2026-01-31T10:42:43.241Z",
  total_posts: 31,
  metrics: {
    views: "1.1M",
    views_raw: 1100000,
    engagement: "103.5K",
    likes: "103.2K",
    comments: 229,
    shares: 33
  },
  creators_count: 5,
  top_creator: {
    handle: "@wenstudiess",
    name: "Kelby Palmer",
    totalViews: 1087692
  }
}
```

### get_top_videos

Returns top performing videos by views.

```typescript
// Usage
const result = executeTool('get_top_videos', {
  limit: 5,              // optional, default: 10
  creator: '@wenstudiess' // optional, filter by creator
});

// Returns
{
  count: 5,
  filter: "creator: @wenstudiess",
  videos: [
    {
      rank: 1,
      views: "547.0K",
      views_raw: 547000,
      creator: "@wenstudiess",
      creator_name: "Kelby Palmer",
      posted: "Jan 25, 2026"
    },
    // ...
  ]
}
```

### get_creator_stats

Returns statistics for each creator.

```typescript
// Usage
const result = executeTool('get_creator_stats', {
  creator: '@wenstudiess' // optional
});

// Returns
{
  creator_count: 5,
  creators: [
    {
      handle: "@wenstudiess",
      name: "Kelby Palmer",
      post_count: 6,
      total_views: 1087692,
      avg_views_per_post: 181282,
      views_formatted: "1.1M"
    },
    // ...
  ],
  best_performer: { ... }
}
```

### get_ugc_by_date

Returns videos filtered by date.

```typescript
// Usage
const result = executeTool('get_ugc_by_date', {
  date: 'Jan 25, 2026'  // or use start_date/end_date
});

// Returns
{
  filter: "Jan 25, 2026",
  count: 2,
  total_views: 547445,
  videos: [...]
}
```

## Configuration

Set the SideShift share URL in the scraper:

```typescript
// scripts/scrape-ugc.ts
const SHARE_URL = 'https://app.sideshift.app/share_analytics?shareID=YOUR_SHARE_ID';
```

## Data Refresh

To update the UGC data:

```bash
npx tsx scripts/scrape-ugc.ts
```

Consider setting up a cron job for automatic refresh:

```bash
# Refresh daily at 6 AM
0 6 * * * cd /path/to/business-os && npx tsx scripts/scrape-ugc.ts
```

## Metrics Tracked

| Metric | Description |
|--------|-------------|
| Views | Total video views |
| Engagement | Total engagement (likes + comments + shares) |
| Likes | Total likes across all videos |
| Comments | Total comments |
| Shares | Total shares |
| Posts | Number of tracked posts |

## Creator Data

Each creator entry includes:

| Field | Description |
|-------|-------------|
| handle | TikTok username (e.g., @wenstudiess) |
| name | Creator's real name |
| postCount | Number of posts tracked |
| totalViews | Sum of all video views |

## Example Queries

The AI agent can answer:

- "Which TikTok video got the most views?"
- "Who is our top performing creator?"
- "Give me a UGC summary"
- "How did @wenstudiess perform?"
- "What videos were posted on Jan 25?"
- "Compare Sarah vs Kelby's performance"

## Troubleshooting

### Scraper Timeout

If the scraper times out, increase the wait time:

```typescript
await page.waitForTimeout(10000); // 10 seconds
```

### Missing Data

If data is missing, check:
1. The share link is still active
2. The page structure hasn't changed
3. Network connectivity

### Debugging

Save a screenshot for debugging:

```typescript
await page.screenshot({ path: 'debug.png', fullPage: true });
```
