/**
 * MuleRouter Client
 *
 * OpenAI-compatible client for MuleRouter API with Qwen models.
 */

import OpenAI from 'openai';

// MuleRouter configuration
const MULEROUTER_BASE_URL = process.env.MULEROUTER_BASE_URL || 'https://api.mulerouter.ai/vendors/openai/v1';
const MULEROUTER_API_KEY = process.env.MULEROUTER_API_KEY;
const DEFAULT_MODEL = process.env.MULEROUTER_MODEL || 'qwen3-max';

// Available models on MuleRouter
export const AVAILABLE_MODELS = {
  'qwen-flash': 'Fast, cost-effective Qwen model',
  'qwen-plus': 'Balanced Qwen model for general use',
  'qwen3-max': 'Flagship Qwen3 model for complex reasoning',
  'qwen3-omni-flash': 'Fast multimodal Qwen3 model',
  'qwen3-vl-flash': 'Vision-language Qwen3 model (fast)',
  'qwen3-vl-plus': 'Vision-language Qwen3 model (balanced)',
  'qwen-vl-max': 'Vision-language Qwen model (max)',
} as const;

export type MuleRouterModel = keyof typeof AVAILABLE_MODELS;

/**
 * Create MuleRouter OpenAI-compatible client
 */
export function createMuleRouterClient() {
  if (!MULEROUTER_API_KEY) {
    throw new Error('MULEROUTER_API_KEY environment variable is required');
  }

  return new OpenAI({
    apiKey: MULEROUTER_API_KEY,
    baseURL: MULEROUTER_BASE_URL,
  });
}

/**
 * Get the default model
 */
export function getDefaultModel(): string {
  return DEFAULT_MODEL;
}

/**
 * Chat completion options
 */
export interface ChatOptions {
  model?: MuleRouterModel | string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/**
 * Message format
 */
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Simple chat completion (non-streaming)
 */
export async function chat(
  messages: Message[],
  options: ChatOptions = {}
): Promise<string> {
  const client = createMuleRouterClient();

  const response = await client.chat.completions.create({
    model: options.model || DEFAULT_MODEL,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
  });

  return response.choices[0]?.message?.content || '';
}

/**
 * Streaming chat completion
 */
export async function* chatStream(
  messages: Message[],
  options: ChatOptions = {}
): AsyncGenerator<string, void, unknown> {
  const client = createMuleRouterClient();

  const stream = await client.chat.completions.create({
    model: options.model || DEFAULT_MODEL,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

/**
 * Business AI system prompt
 */
export function getBusinessAISystemPrompt(userTeam: string, mixpanelData?: any): string {
  const dataContext = mixpanelData ? `
## Available Data (Mixpanel - Last 30 Days)

${JSON.stringify(mixpanelData.summary, null, 2)}

You have access to detailed daily metrics for:
- Signups, registrations
- Dashboard views, chat usage
- Subscription page views and orders
- Onboarding funnel events
` : '';

  return `You are the **Business AI Coordinator** for ZUAI (Scan & Learn), an AI education app where students scan problems and get AI tutoring.

## Your Role: AI Chief of Staff

You provide comprehensive business intelligence by:
- Synthesizing data into clear executive insights
- Spotting trends and anomalies
- Providing actionable recommendations with priorities

## Business Context: ZUAI / Scan & Learn

**Product**: Mobile app where students scan homework problems → AI analyzes → Voice tutor explains step-by-step

**Business Model**: Freemium with subscription
- Free tier: Limited usage
- Premium: Unlimited access, advanced features

**Key Success Metrics**:
- Daily active users and signups
- Chat/tutor engagement (messages, sessions)
- Subscription page views → orders (conversion)
- D1/D7/D30 retention
- MRR growth
${dataContext}

## How to Respond

### For Quick Questions
Direct, data-driven answer with key numbers and trends.

### For Analysis Requests
1. **TL;DR** - One sentence summary
2. **Key Metrics** - The numbers that matter
3. **Insights** - What the data tells us
4. **Recommendations** - Prioritized actions

### For Briefings
1. **Health Score** (🟢 Good / 🟡 Watch / 🔴 Alert)
2. **Wins** - What's going well
3. **Concerns** - What needs attention
4. **Top Priorities**

## Response Guidelines

1. **Be specific** - Use actual numbers from the data
2. **Compare periods** - Show trends (vs last week, vs last month)
3. **Be actionable** - Every insight should suggest what to do
4. **Flag anomalies** - Call out unusual patterns

User's team: ${userTeam}
Current date: ${new Date().toISOString().split('T')[0]}
`;
}
