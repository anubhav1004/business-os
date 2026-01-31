/**
 * Google Analytics 4 MCP Server
 *
 * Provides tools for querying Google Analytics 4 data.
 * Requires Google Analytics Data API credentials.
 */

export interface GoogleAnalyticsConfig {
  propertyId: string;
  credentials: any; // Google service account credentials
}

/**
 * Create Google Analytics MCP server configuration
 */
export function createGoogleAnalyticsMCP(config: GoogleAnalyticsConfig) {
  // Note: This requires @google-analytics/data package
  // npm install @google-analytics/data

  return {
    name: 'google-analytics',
    version: '1.0.0',
    tools: [
      {
        name: 'get_traffic_data',
        description: 'Get website traffic data for a date range',
        inputSchema: {
          type: 'object',
          properties: {
            start_date: {
              type: 'string',
              format: 'date',
              description: 'Start date (YYYY-MM-DD)',
            },
            end_date: {
              type: 'string',
              format: 'date',
              description: 'End date (YYYY-MM-DD)',
            },
            metrics: {
              type: 'array',
              items: { type: 'string' },
              description: 'Metrics to retrieve (e.g., sessions, users, pageviews)',
              default: ['sessions', 'users', 'pageviews'],
            },
            dimensions: {
              type: 'array',
              items: { type: 'string' },
              description: 'Dimensions to group by (e.g., date, source, medium)',
              default: ['date'],
            },
          },
          required: ['start_date', 'end_date'],
        },
        execute: async (input: any) => {
          // Implementation with Google Analytics Data API
          // This is a placeholder - implement with actual GA4 API calls
          const { BetaAnalyticsDataClient } = require('@google-analytics/data');

          const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: config.credentials,
          });

          const [response] = await analyticsDataClient.runReport({
            property: `properties/${config.propertyId}`,
            dateRanges: [
              {
                startDate: input.start_date,
                endDate: input.end_date,
              },
            ],
            dimensions: (input.dimensions || ['date']).map((name: string) => ({ name })),
            metrics: (input.metrics || ['sessions', 'users']).map((name: string) => ({ name })),
          });

          return response;
        },
      },
      {
        name: 'get_conversion_data',
        description: 'Get conversion and goal completion data',
        inputSchema: {
          type: 'object',
          properties: {
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            conversion_event: {
              type: 'string',
              description: 'Conversion event name (e.g., purchase, signup)',
            },
          },
          required: ['start_date', 'end_date'],
        },
        execute: async (input: any) => {
          const { BetaAnalyticsDataClient } = require('@google-analytics/data');

          const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: config.credentials,
          });

          const [response] = await analyticsDataClient.runReport({
            property: `properties/${config.propertyId}`,
            dateRanges: [
              {
                startDate: input.start_date,
                endDate: input.end_date,
              },
            ],
            dimensions: [{ name: 'date' }],
            metrics: [
              { name: 'conversions' },
              { name: 'conversionRate' },
              { name: 'totalRevenue' },
            ],
            ...(input.conversion_event && {
              dimensionFilter: {
                filter: {
                  fieldName: 'eventName',
                  stringFilter: {
                    value: input.conversion_event,
                  },
                },
              },
            }),
          });

          return response;
        },
      },
      {
        name: 'get_top_pages',
        description: 'Get top performing pages by traffic',
        inputSchema: {
          type: 'object',
          properties: {
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            limit: {
              type: 'number',
              description: 'Number of pages to return',
              default: 10,
            },
          },
          required: ['start_date', 'end_date'],
        },
        execute: async (input: any) => {
          const { BetaAnalyticsDataClient } = require('@google-analytics/data');

          const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: config.credentials,
          });

          const [response] = await analyticsDataClient.runReport({
            property: `properties/${config.propertyId}`,
            dateRanges: [
              {
                startDate: input.start_date,
                endDate: input.end_date,
              },
            ],
            dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
            metrics: [
              { name: 'screenPageViews' },
              { name: 'averageSessionDuration' },
              { name: 'bounceRate' },
            ],
            orderBys: [
              {
                metric: {
                  metricName: 'screenPageViews',
                },
                desc: true,
              },
            ],
            limit: input.limit || 10,
          });

          return response;
        },
      },
      {
        name: 'get_traffic_sources',
        description: 'Get traffic breakdown by source/medium',
        inputSchema: {
          type: 'object',
          properties: {
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
          },
          required: ['start_date', 'end_date'],
        },
        execute: async (input: any) => {
          const { BetaAnalyticsDataClient } = require('@google-analytics/data');

          const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: config.credentials,
          });

          const [response] = await analyticsDataClient.runReport({
            property: `properties/${config.propertyId}`,
            dateRanges: [
              {
                startDate: input.start_date,
                endDate: input.end_date,
              },
            ],
            dimensions: [
              { name: 'sessionSource' },
              { name: 'sessionMedium' },
            ],
            metrics: [
              { name: 'sessions' },
              { name: 'users' },
              { name: 'conversions' },
            ],
            orderBys: [
              {
                metric: {
                  metricName: 'sessions',
                },
                desc: true,
              },
            ],
          });

          return response;
        },
      },
    ],
  };
}

/**
 * Example usage:
 *
 * ```typescript
 * const googleAnalyticsMCP = createGoogleAnalyticsMCP({
 *   propertyId: process.env.GA4_PROPERTY_ID!,
 *   credentials: JSON.parse(process.env.GA4_CREDENTIALS!),
 * });
 *
 * const options: ClaudeAgentOptions = {
 *   mcpServers: {
 *     'google-analytics': googleAnalyticsMCP,
 *   },
 * };
 * ```
 */
