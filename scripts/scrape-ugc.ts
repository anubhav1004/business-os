/**
 * UGC Tracker Scraper - Playwright Script
 *
 * Scrapes TikTok UGC data from SideShift analytics dashboard
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

const SHARE_URL = 'https://app.sideshift.app/share_analytics?shareID=mVZoYYEfNLsrmweAnify';

interface VideoData {
  rank: number;
  views: number;
  viewsFormatted: string;
  creatorHandle: string;
  creatorName: string;
  postedAt: string;
  platform: string;
}

interface UGCData {
  shareId: string;
  scrapedAt: string;
  summary: {
    totalViews: number;
    totalViewsFormatted: string;
    totalEngagement: number;
    totalEngagementFormatted: string;
    totalLikes: number;
    totalLikesFormatted: string;
    totalComments: number;
    totalShares: number;
    totalPosts: number;
  };
  videos: VideoData[];
  creators: {
    handle: string;
    name: string;
    postCount: number;
    totalViews: number;
  }[];
}

function parseNumber(str: string): number {
  // Parse numbers like "1.1M", "103.5K", "547.0K", "229"
  const cleaned = str.replace(/,/g, '').trim();
  const match = cleaned.match(/^([\d.]+)\s*([KkMmBb])?$/);

  if (!match) return parseInt(cleaned) || 0;

  const num = parseFloat(match[1]);
  const suffix = match[2]?.toUpperCase();

  switch (suffix) {
    case 'K': return Math.round(num * 1000);
    case 'M': return Math.round(num * 1000000);
    case 'B': return Math.round(num * 1000000000);
    default: return Math.round(num);
  }
}

async function scrapeUGCDashboard(): Promise<UGCData> {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  console.log(`Navigating to ${SHARE_URL}...`);
  await page.goto(SHARE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  // Wait for the page to fully render
  await page.waitForTimeout(8000);

  // Get page text content
  const pageText = await page.evaluate(() => document.body.innerText);

  // Parse summary metrics
  const summaryMatch = pageText.match(
    /Views\s+([\d.]+[KMB]?)\s+.*?Engagement\s+([\d.]+[KMB]?)\s+.*?Likes\s+([\d.]+[KMB]?)\s+.*?Comments\s+([\d,]+)\s+.*?Shares\s+([\d,]+)\s+.*?Posts\s+([\d,]+)/s
  );

  const summary = {
    totalViews: 0,
    totalViewsFormatted: '0',
    totalEngagement: 0,
    totalEngagementFormatted: '0',
    totalLikes: 0,
    totalLikesFormatted: '0',
    totalComments: 0,
    totalShares: 0,
    totalPosts: 0,
  };

  if (summaryMatch) {
    summary.totalViewsFormatted = summaryMatch[1];
    summary.totalViews = parseNumber(summaryMatch[1]);
    summary.totalEngagementFormatted = summaryMatch[2];
    summary.totalEngagement = parseNumber(summaryMatch[2]);
    summary.totalLikesFormatted = summaryMatch[3];
    summary.totalLikes = parseNumber(summaryMatch[3]);
    summary.totalComments = parseNumber(summaryMatch[4]);
    summary.totalShares = parseNumber(summaryMatch[5]);
    summary.totalPosts = parseNumber(summaryMatch[6]);
  }

  console.log('Summary parsed:', summary);

  // Parse video entries - pattern: #N followed by views, handle, date, name
  const videos: VideoData[] = [];

  // Match pattern: #1\n547.0K\n@wenstudiess\nJan 25, 2026\nKelby Palmer
  const videoPattern = /#(\d+)\s+([\d.]+[KMB]?)\s+(@\w+)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d+),?\s*(\d{4})\s+([A-Za-z\s]+?)(?=#\d|$)/g;

  let match;
  while ((match = videoPattern.exec(pageText)) !== null) {
    videos.push({
      rank: parseInt(match[1]),
      views: parseNumber(match[2]),
      viewsFormatted: match[2],
      creatorHandle: match[3],
      postedAt: `${match[4]} ${match[5]}, ${match[6]}`,
      creatorName: match[7].trim(),
      platform: 'tiktok',
    });
  }

  // If regex didn't work well, try line-by-line parsing
  if (videos.length === 0) {
    console.log('Trying line-by-line parsing...');
    const lines = pageText.split('\n').map(l => l.trim()).filter(l => l);

    let i = 0;
    while (i < lines.length) {
      const rankMatch = lines[i].match(/^#(\d+)$/);
      if (rankMatch && i + 4 < lines.length) {
        const rank = parseInt(rankMatch[1]);
        const viewsStr = lines[i + 1];
        const handle = lines[i + 2];
        const date = lines[i + 3];
        const name = lines[i + 4];

        if (handle.startsWith('@') && viewsStr.match(/^[\d.]+[KMB]?$/)) {
          videos.push({
            rank,
            views: parseNumber(viewsStr),
            viewsFormatted: viewsStr,
            creatorHandle: handle,
            postedAt: date,
            creatorName: name,
            platform: 'tiktok',
          });
          i += 5;
          continue;
        }
      }
      i++;
    }
  }

  console.log(`Found ${videos.length} videos`);

  // Aggregate by creator
  const creatorMap = new Map<string, { handle: string; name: string; postCount: number; totalViews: number }>();

  for (const video of videos) {
    const existing = creatorMap.get(video.creatorHandle);
    if (existing) {
      existing.postCount++;
      existing.totalViews += video.views;
    } else {
      creatorMap.set(video.creatorHandle, {
        handle: video.creatorHandle,
        name: video.creatorName,
        postCount: 1,
        totalViews: video.views,
      });
    }
  }

  const creators = Array.from(creatorMap.values()).sort((a, b) => b.totalViews - a.totalViews);

  await browser.close();

  return {
    shareId: 'mVZoYYEfNLsrmweAnify',
    scrapedAt: new Date().toISOString(),
    summary,
    videos,
    creators,
  };
}

async function main() {
  try {
    console.log('Starting UGC Dashboard Scraper...\n');
    const data = await scrapeUGCDashboard();

    const outputPath = join(process.cwd(), 'data', 'ugc-data.json');
    writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log(`\nData saved to ${outputPath}`);
    console.log(`Total videos: ${data.videos.length}`);
    console.log(`Total views: ${data.summary.totalViewsFormatted}`);
    console.log(`Creators: ${data.creators.map(c => c.handle).join(', ')}`);

  } catch (error) {
    console.error('Scraping failed:', error);
    process.exit(1);
  }
}

main();
