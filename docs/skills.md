# Skills System

This document describes the skills system in Business OS - a way to define reusable AI capabilities.

## Overview

Skills are markdown files that define a set of tools and instructions for the AI agent. They can be:
- Injected as system prompts
- Used for documentation
- Potentially loaded dynamically at runtime

## Skill Location

Skills are stored in `.claude/skills/`:

```
.claude/
└── skills/
    ├── business-ai.md           # Full skill definition
    └── business-ai-prompt.txt   # Compact system prompt
```

## Skill Format

### Full Definition (Markdown)

```markdown
# Skill Name

## Description
What this skill does.

## When to Use
- Trigger conditions
- Example queries

## Available Tools

### tool_name
Description of the tool.
- Parameters:
  - `param1` (required): Description
  - `param2` (optional): Description
- Returns: What it returns

## Response Format
How to structure responses.

## Example Queries
- "Example question 1"
- "Example question 2"
```

### Compact System Prompt

For direct injection into LLM context:

```text
You are the Business AI Coordinator.

## TOOLS
1. tool_name(params) - Description
2. another_tool(params) - Description

## RESPONSE FORMAT
1. **TL;DR** - One sentence
2. **Key Numbers** - Metrics
```

## Business AI Skill

The main skill file defines all available tools:

### Mixpanel Analytics Tools
| Tool | Description |
|------|-------------|
| `get_business_summary` | Overview of product metrics |
| `get_metric_data` | Detailed data for an event |
| `get_daily_trend` | Day-over-day changes |
| `calculate_conversion` | Funnel conversion rate |
| `compare_periods` | Compare time periods |

### TikTok UGC Tools
| Tool | Description |
|------|-------------|
| `get_ugc_summary` | UGC performance overview |
| `get_top_videos` | Top videos by views |
| `get_creator_stats` | Per-creator statistics |
| `get_ugc_by_date` | Videos by date |

## Using Skills

### Static Injection

Inject the skill content into the system prompt:

```typescript
import { readFileSync } from 'fs';

const skillContent = readFileSync('.claude/skills/business-ai.md', 'utf-8');

const SYSTEM_PROMPT = `
${skillContent}

Current date: ${new Date().toISOString().split('T')[0]}
`;
```

### Dynamic Loading

Load skills based on context:

```typescript
function loadSkill(skillName: string): string {
  const skillPath = `.claude/skills/${skillName}.md`;
  if (existsSync(skillPath)) {
    return readFileSync(skillPath, 'utf-8');
  }
  return '';
}

// Use based on query type
if (query.includes('tiktok') || query.includes('ugc')) {
  skills.push(loadSkill('ugc-tracker'));
}
```

## Creating New Skills

### 1. Create the skill file

```bash
touch .claude/skills/my-new-skill.md
```

### 2. Define the structure

```markdown
# My New Skill

## Description
What this skill enables.

## When to Use
- When user asks about X
- When user needs Y

## Available Tools

### my_tool
Does something useful.
- Parameters:
  - `input` (required): The input data
- Returns: Processed result

## Response Format
- Start with a summary
- Include key data
- End with recommendations

## Example Queries
- "How do I use this skill?"
- "Show me the data"
```

### 3. Implement the tools

Add tool definitions to `lib/ai/agent.ts`:

```typescript
{
  type: 'function',
  function: {
    name: 'my_tool',
    description: 'Does something useful',
    parameters: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'The input data' }
      },
      required: ['input'],
    },
  },
}
```

### 4. Add tool implementation

```typescript
function toolMyTool(args: { input: string }): string {
  // Implementation
  return JSON.stringify({ result: 'processed' });
}
```

### 5. Register in dispatcher

```typescript
case 'my_tool':
  return toolMyTool(args);
```

## Skill Composition

Combine multiple skills for complex agents:

```typescript
const skills = [
  loadSkill('business-ai'),
  loadSkill('ugc-tracker'),
  loadSkill('competitor-analysis'),
];

const SYSTEM_PROMPT = skills.join('\n\n---\n\n');
```

## Best Practices

1. **Clear descriptions**: Tools should be self-explanatory
2. **Example queries**: Help the LLM understand when to use each tool
3. **Response format**: Define structured output expectations
4. **Versioning**: Track skill changes in git
5. **Testing**: Verify tools work as documented

## Comparison with Claude Code Skills

| Aspect | Claude Code | Business OS |
|--------|-------------|-------------|
| Format | Markdown | Markdown |
| Location | `.claude/skills/` | `.claude/skills/` |
| Loading | Built-in | Manual/Custom |
| Invocation | `/skill-name` | Query-based |
| Tools | Native | OpenAI format |

## Future Enhancements

- [ ] Dynamic skill loading based on query
- [ ] Skill versioning and A/B testing
- [ ] Skill marketplace/sharing
- [ ] Automatic tool discovery from skills
