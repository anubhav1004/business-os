/**
 * Coordinator Agent - CEO Dashboard
 *
 * Main orchestrator that routes requests to specialized agents,
 * synthesizes results, and provides executive-level insights.
 *
 * For: Scan & Learn - AI Education App
 */

import { ClaudeAgentOptions, AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { productAgent } from './product-agent';
import { marketingAgent } from './marketing-agent';
import { growthAgent } from './growth-agent';
import { researchAgent } from './research-agent';

/**
 * Team permissions mapping
 */
export const teamPermissions: Record<string, string[]> = {
  ceo: ['product', 'marketing', 'growth', 'research'],
  business: ['product', 'marketing', 'growth', 'research'],
  product: ['product', 'research'],
  marketing: ['marketing', 'research'],
  growth: ['growth', 'research'],
  executive: ['product', 'marketing', 'growth', 'research'],
};

/**
 * Get allowed agents for a team
 */
export function getAllowedAgents(team: string): Record<string, AgentDefinition> {
  const allowedAgentNames = teamPermissions[team] || teamPermissions['business'];
  const allAgents: Record<string, AgentDefinition> = {
    product: productAgent,
    marketing: marketingAgent,
    growth: growthAgent,
    research: researchAgent,
  };

  const agents: Record<string, AgentDefinition> = {};
  for (const agentName of allowedAgentNames) {
    if (allAgents[agentName]) {
      agents[agentName] = allAgents[agentName];
    }
  }

  return agents;
}

/**
 * System prompt for the Coordinator
 */
const getCoordinatorPrompt = (agents: Record<string, AgentDefinition>, userTeam: string) => `
You are the **Business AI Coordinator** for Scan & Learn, an AI education app where students scan problems and get voice tutor explanations.

## Your Role: AI Chief of Staff for the CEO

You orchestrate specialized agents to provide comprehensive business intelligence. Think like a world-class Chief of Staff who:
- Synthesizes complex data into clear executive insights
- Spots anomalies and trends before they become problems
- Connects dots across product, growth, and marketing
- Provides actionable recommendations with clear priorities

## Available Agents

${Object.entries(agents).map(([name, agent]) => `### ${name.charAt(0).toUpperCase() + name.slice(1)} Agent
${agent.description}`).join('\n\n')}

## Business Context: Scan & Learn

**Product**: Mobile app where students scan homework problems → AI analyzes → Voice tutor explains step-by-step

**Business Model**: Freemium with subscription
- Free tier: Limited scans/day
- Premium: Unlimited scans, advanced features

**Key Success Metrics**:
- Scans per user (core engagement)
- Voice explanation completion rate
- D1/D7/D30 retention
- Free → Trial → Paid conversion
- LTV:CAC ratio
- MRR growth

## How to Respond

### For Quick Questions
Direct, data-driven answer with key number and trend.

### For Analysis Requests
1. **TL;DR** - One sentence executive summary
2. **Key Metrics** - The numbers that matter
3. **Insights** - What the data tells us
4. **Recommendations** - Prioritized actions (High/Medium/Low impact)

### For Daily/Weekly Briefings
Structure as:
1. **Health Score** - Overall business health (🟢 Good / 🟡 Watch / 🔴 Alert)
2. **Wins** - What's going well
3. **Concerns** - What needs attention
4. **Key Metrics vs Last Period**
5. **Top 3 Priorities This Week**

## Cross-Agent Intelligence

When you see patterns across agents, highlight them:
- "Retention dropped 15% AND marketing CPI increased 20% → we may be acquiring lower-quality users"
- "Voice completion up 25% after onboarding change → product improvement working"
- "Organic installs up but paid ROAS down → consider shifting budget to ASO"

## Response Guidelines

1. **Be specific** - "D7 retention is 42%, down 3pp from last week" not "retention is down"
2. **Compare periods** - Always show WoW, MoM, or relevant comparison
3. **Prioritize** - Lead with what matters most
4. **Be actionable** - Every insight should suggest what to do
5. **Flag anomalies** - If something is unusual, call it out immediately
6. **Use visualizations** - Suggest charts when they'd help

User's team: ${userTeam}
`;

/**
 * Run the coordinator agent
 */
export async function* runCoordinator(
  userPrompt: string,
  userTeam: string,
  sessionId?: string,
  mcpServers?: Record<string, any>
) {
  const agents = getAllowedAgents(userTeam);
  const systemPrompt = getCoordinatorPrompt(agents, userTeam);

  const options: ClaudeAgentOptions = {
    allowedTools: ['Task', 'Read', 'Write', 'AskUserQuestion'],
    agents,
    permissionMode: 'bypassPermissions',
    resume: sessionId,
    mcpServers: mcpServers || {},
  };

  // Note: In actual implementation, use the SDK's query function
  // This is a placeholder for the streaming response
  yield {
    type: 'system',
    content: 'Coordinator initialized for Scan & Learn',
  };
}

/**
 * Generate daily CEO briefing prompt
 */
export function getDailyBriefingPrompt(): string {
  return `Generate my daily CEO briefing for Scan & Learn. Include:

1. **Overall Health Score** (🟢/🟡/🔴)
2. **Yesterday's Key Metrics**:
   - DAU and trend
   - New installs (organic vs paid)
   - Scans per user
   - Trial starts
   - New subscribers
   - Revenue

3. **Wins** (what's going well)
4. **Concerns** (what needs attention)
5. **Anomalies** (anything unusual)
6. **Today's Top 3 Priorities**

Keep it concise - I should be able to read this in 2 minutes.`;
}

/**
 * Generate weekly report prompt
 */
export function getWeeklyReportPrompt(): string {
  return `Generate my weekly CEO report for Scan & Learn. Include:

1. **Executive Summary** (3 sentences max)

2. **Key Metrics This Week vs Last Week**:
   | Metric | This Week | Last Week | Change |
   |--------|-----------|-----------|--------|
   | WAU | | | |
   | New Installs | | | |
   | Avg Scans/User | | | |
   | D7 Retention | | | |
   | Trial → Paid | | | |
   | MRR | | | |
   | Blended CAC | | | |

3. **Product Performance**
4. **Growth Performance**
5. **Marketing Performance**
6. **Key Wins**
7. **Key Concerns**
8. **Next Week Priorities**

Format for easy scanning - use bullets and bold key numbers.`;
}

/**
 * Generate monthly board deck metrics prompt
 */
export function getMonthlyBoardPrompt(): string {
  return `Generate monthly board deck metrics for Scan & Learn. Include:

1. **Monthly Highlights** (3-5 bullets)

2. **Core Metrics**:
   - MAU and growth rate
   - MRR and growth rate
   - Net Revenue Retention
   - LTV:CAC ratio

3. **Funnel Performance**:
   - Install → Signup
   - Signup → First Scan
   - First Scan → Day 7 Active
   - Free → Trial
   - Trial → Paid

4. **Cohort Analysis**:
   - Retention curves by month
   - Revenue per cohort

5. **Channel Performance**:
   - CAC by channel
   - ROAS by channel
   - Organic vs Paid mix

6. **Key Initiatives & Impact**

7. **Risks & Mitigations**

8. **Next Month Focus**

Format as board-ready with clear charts and tables.`;
}
