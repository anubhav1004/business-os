# Qwen Agent with MuleRouter

This document describes the agentic AI system powering Business OS.

## Overview

Business OS uses **Qwen3-max** as its LLM, accessed through **MuleRouter** - an OpenAI-compatible API gateway. The agent implements a multi-turn tool-calling loop with visible reasoning.

## Architecture

```
User Query
    ↓
Chat API (app/api/chat/route.ts)
    ↓
Qwen Agent (lib/ai/agent.ts)
    ↓
┌───────────────────────────────────────┐
│           Agentic Loop                │
│  ┌─────────────────────────────────┐  │
│  │ 1. Send to Qwen via MuleRouter  │  │
│  │ 2. Check for tool_calls         │  │
│  │ 3. Execute tools if present     │  │
│  │ 4. Add results to context       │  │
│  │ 5. Loop until final response    │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
    ↓
Streaming Response (SSE)
```

## Configuration

```bash
# .env
MULEROUTER_API_KEY=sk-mr-your-key-here
MULEROUTER_BASE_URL=https://api.mulerouter.ai/vendors/openai/v1
MULEROUTER_MODEL=qwen3-max
```

## MuleRouter Client

The agent uses the OpenAI SDK with MuleRouter as the base URL:

```typescript
// lib/ai/agent.ts
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.MULEROUTER_API_KEY,
  baseURL: 'https://api.mulerouter.ai/vendors/openai/v1',
});
```

## Tool Calling Format

Tools are defined in OpenAI function-calling format:

```typescript
const TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_business_summary',
      description: 'Get an overview of all available business metrics',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  // ... more tools
];
```

## Agentic Loop

The core agent loop with multi-turn reasoning:

```typescript
export async function* runAgent(
  userMessage: string
): AsyncGenerator<AgentEvent> {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ];

  let iteration = 0;

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    yield { type: 'thinking', content: `Iteration ${iteration}...` };

    const response = await client.chat.completions.create({
      model: 'qwen3-max',
      messages,
      tools: TOOLS,
      tool_choice: 'auto',
    });

    const message = response.choices[0].message;

    // If tool calls present, execute them
    if (message.tool_calls?.length > 0) {
      for (const toolCall of message.tool_calls) {
        yield { type: 'tool_call', content: toolCall };

        const result = executeTool(toolCall.function.name, args);

        yield { type: 'tool_result', content: result };

        messages.push({ role: 'tool', content: result });
      }
      continue; // Loop for next response
    }

    // No tool calls = final response
    yield { type: 'text', content: message.content };
    break;
  }
}
```

## Event Types

The agent yields events that are streamed to the frontend:

| Event Type | Description |
|------------|-------------|
| `thinking` | Agent is processing |
| `tool_call` | Agent decided to call a tool |
| `tool_result` | Tool execution result |
| `text` | Final text response |
| `done` | Agent finished |
| `error` | Error occurred |

## Streaming Response

The Chat API streams events via Server-Sent Events (SSE):

```typescript
// app/api/chat/route.ts
const stream = new ReadableStream({
  async start(controller) {
    for await (const event of runAgent(message)) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
      );
    }
    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    controller.close();
  },
});

return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
});
```

## System Prompt

The agent uses a structured system prompt:

```typescript
const SYSTEM_PROMPT = `You are the Business AI Coordinator for ZUAI.

## IMPORTANT: Always Use Tools
- NEVER make up numbers or guess data
- ALWAYS call tools to get real data before answering

## Available Tools
1. get_business_summary - Overview of all metrics
2. get_metric_data - Detailed data for a specific event
...

## Response Format
1. **TL;DR** - One sentence answer
2. **Key Numbers** - The specific metrics
3. **Insight** - What it means
4. **Recommendation** - What to do
`;
```

## Example Tool Call Flow

```
User: "What were signups yesterday?"

→ Iteration 1: Processing...
→ tool_call: get_metric_data
  args: {"event_name":"signup_completed","start_date":"2026-01-30"}
→ tool_result: {"total":0,"average":0,...}
→ Iteration 2: Processing...
→ text: "**TL;DR**: There were 0 signups yesterday..."
→ done
```

## Frontend Integration

The ChatInterface component handles streaming:

```typescript
// components/chat/ChatInterface.tsx
const reader = response.body?.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const parsed = JSON.parse(chunk.slice(6)); // Remove "data: "

  switch (parsed.type) {
    case 'tool_call':
      setToolCalls([...toolCalls, parsed]);
      break;
    case 'text':
      setAssistantContent(prev => prev + parsed.content);
      break;
  }
}
```

## Key Differences from Claude Agent SDK

| Feature | Claude Agent SDK | Business OS (Qwen) |
|---------|------------------|-------------------|
| Tool Definition | `@tool` decorator | OpenAI `tools` array |
| Tool Calling | Native `tool_use` | OpenAI function calling |
| Agentic Loop | Built-in | Custom `while` loop |
| Streaming | Native events | SSE with custom events |
| Provider | Anthropic | MuleRouter (Qwen) |

## Error Handling

```typescript
try {
  const response = await client.chat.completions.create({...});
} catch (error) {
  yield {
    type: 'error',
    content: error.message,
  };
}
```

## Testing

```bash
# Test via curl
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What were signups yesterday?","userEmail":"test@test.com"}'
```
