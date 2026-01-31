#!/usr/bin/env python3
"""
Business AI Agent - Custom Agentic System

A proper agentic system with tool use, reasoning, and multi-step execution.
Uses OpenAI-compatible API (MuleRouter + Qwen).
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Any, Generator
from dataclasses import dataclass
from openai import OpenAI

# ============= CONFIGURATION =============

MULEROUTER_API_KEY = os.getenv(
    'MULEROUTER_API_KEY',
    'sk-mr-896ba94c90409b4cebd0f99735519843c3e7e28f76dd3e6bcb6e9102af4de694'
)
MULEROUTER_BASE_URL = 'https://api.mulerouter.ai/vendors/openai/v1'
MODEL_NAME = 'qwen3-max'
MAX_ITERATIONS = 10  # Maximum tool call iterations

# Data path
DATA_PATH = Path(__file__).parent.parent / 'data' / 'mixpanel-data.json'

# Create OpenAI client for MuleRouter
client = OpenAI(
    api_key=MULEROUTER_API_KEY,
    base_url=MULEROUTER_BASE_URL
)


# ============= DATA LOADING =============

def load_mixpanel_data() -> Dict:
    """Load Mixpanel data from JSON file."""
    try:
        if DATA_PATH.exists():
            with open(DATA_PATH, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading Mixpanel data: {e}")
    return {}


# ============= TOOL DEFINITIONS =============

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_business_summary",
            "description": "Get an overview of all available business metrics and KPIs. Use this FIRST to understand what data is available before making specific queries.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_metric_data",
            "description": "Get detailed daily data and statistics for a specific metric/event. Returns daily values and aggregate statistics (total, average, max, min).",
            "parameters": {
                "type": "object",
                "properties": {
                    "event_name": {
                        "type": "string",
                        "description": "Name of the event/metric (e.g., 'signup_completed', 'dashboard_viewed', 'chat_messages', 'subscription_order_initiated')"
                    },
                    "start_date": {
                        "type": "string",
                        "description": "Optional start date filter (YYYY-MM-DD format)"
                    },
                    "end_date": {
                        "type": "string",
                        "description": "Optional end date filter (YYYY-MM-DD format)"
                    }
                },
                "required": ["event_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_daily_trend",
            "description": "Get daily trend with day-over-day changes for a metric. Shows recent patterns and momentum.",
            "parameters": {
                "type": "object",
                "properties": {
                    "event_name": {
                        "type": "string",
                        "description": "Name of the event/metric"
                    },
                    "days": {
                        "type": "integer",
                        "description": "Number of recent days to show (default: 7)"
                    }
                },
                "required": ["event_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_conversion",
            "description": "Calculate conversion rate between two events (funnel analysis). Shows conversion percentage and drop-off.",
            "parameters": {
                "type": "object",
                "properties": {
                    "start_event": {
                        "type": "string",
                        "description": "The starting event in the funnel (e.g., 'welcome_screen_viewed', 'signup_start')"
                    },
                    "end_event": {
                        "type": "string",
                        "description": "The ending event in the funnel (e.g., 'signup_completed', 'subscription_order_initiated')"
                    }
                },
                "required": ["start_event", "end_event"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "compare_periods",
            "description": "Compare a metric between two time periods. Useful for week-over-week or custom period comparisons.",
            "parameters": {
                "type": "object",
                "properties": {
                    "event_name": {
                        "type": "string",
                        "description": "Name of the event/metric to compare"
                    },
                    "period1_start": {
                        "type": "string",
                        "description": "Start date of first (current) period (YYYY-MM-DD)"
                    },
                    "period1_end": {
                        "type": "string",
                        "description": "End date of first (current) period (YYYY-MM-DD)"
                    },
                    "period2_start": {
                        "type": "string",
                        "description": "Start date of second (previous) period (YYYY-MM-DD)"
                    },
                    "period2_end": {
                        "type": "string",
                        "description": "End date of second (previous) period (YYYY-MM-DD)"
                    }
                },
                "required": ["event_name", "period1_start", "period1_end", "period2_start", "period2_end"]
            }
        }
    }
]


# ============= TOOL IMPLEMENTATIONS =============

def find_event(events: Dict, name: str) -> tuple:
    """Find an event by name (fuzzy matching)."""
    event_key = name.lower().replace(' ', '_').replace('-', '_')
    for k in events.keys():
        if k.lower() == event_key or event_key in k.lower() or k.lower() in event_key:
            return k, events[k]
    return None, None


def tool_get_business_summary(args: Dict) -> str:
    """Get business summary."""
    data = load_mixpanel_data()
    if not data:
        return json.dumps({"error": "No Mixpanel data available"})

    return json.dumps({
        "project_id": data.get("project_id"),
        "date_range": data.get("date_range"),
        "scraped_at": data.get("scraped_at"),
        "summary": data.get("summary", {}),
        "available_metrics": list(data.get("events", {}).keys())
    }, indent=2)


def tool_get_metric_data(args: Dict) -> str:
    """Get metric data."""
    data = load_mixpanel_data()
    if not data:
        return json.dumps({"error": "No Mixpanel data available"})

    event_name = args.get("event_name", "")
    start_date = args.get("start_date")
    end_date = args.get("end_date")

    events = data.get("events", {})
    matching_key, event_data = find_event(events, event_name)

    if not matching_key:
        return json.dumps({
            "error": f"Event '{event_name}' not found",
            "available_events": list(events.keys())
        })

    # Filter by date
    if start_date or end_date:
        event_data = {
            d: v for d, v in event_data.items()
            if (not start_date or d >= start_date) and (not end_date or d <= end_date)
        }

    values = list(event_data.values())
    return json.dumps({
        "event": matching_key,
        "data": event_data,
        "stats": {
            "total": sum(values),
            "average": round(sum(values) / len(values)) if values else 0,
            "max": max(values) if values else 0,
            "min": min(values) if values else 0,
            "days": len(values)
        }
    }, indent=2)


def tool_get_daily_trend(args: Dict) -> str:
    """Get daily trend."""
    data = load_mixpanel_data()
    if not data:
        return json.dumps({"error": "No Mixpanel data available"})

    event_name = args.get("event_name", "")
    days = args.get("days", 7)

    events = data.get("events", {})
    matching_key, event_data = find_event(events, event_name)

    if not matching_key:
        return json.dumps({
            "error": f"Event '{event_name}' not found",
            "available_events": list(events.keys())
        })

    dates = sorted(event_data.keys())[-days:]
    trend = []

    for i, date in enumerate(dates):
        value = event_data[date]
        entry = {"date": date, "value": value}

        if i > 0:
            prev = event_data[dates[i-1]]
            change = value - prev
            change_pct = (change / prev * 100) if prev > 0 else 0
            entry["change"] = change
            entry["change_percent"] = f"{change_pct:+.1f}%"

        trend.append(entry)

    return json.dumps({
        "event": matching_key,
        "days": days,
        "trend": trend
    }, indent=2)


def tool_calculate_conversion(args: Dict) -> str:
    """Calculate conversion between events."""
    data = load_mixpanel_data()
    if not data:
        return json.dumps({"error": "No Mixpanel data available"})

    start_event = args.get("start_event", "")
    end_event = args.get("end_event", "")

    events = data.get("events", {})

    start_key, start_data = find_event(events, start_event)
    end_key, end_data = find_event(events, end_event)

    if not start_key:
        return json.dumps({"error": f"Start event '{start_event}' not found"})
    if not end_key:
        return json.dumps({"error": f"End event '{end_event}' not found"})

    start_total = sum(start_data.values())
    end_total = sum(end_data.values())
    conversion = (end_total / start_total * 100) if start_total > 0 else 0

    return json.dumps({
        "funnel": f"{start_key} -> {end_key}",
        "start_event": {"name": start_key, "total": start_total},
        "end_event": {"name": end_key, "total": end_total},
        "conversion_rate": f"{conversion:.2f}%",
        "drop_off": f"{100 - conversion:.2f}%"
    }, indent=2)


def tool_compare_periods(args: Dict) -> str:
    """Compare two time periods."""
    data = load_mixpanel_data()
    if not data:
        return json.dumps({"error": "No Mixpanel data available"})

    event_name = args.get("event_name", "")
    p1_start = args.get("period1_start")
    p1_end = args.get("period1_end")
    p2_start = args.get("period2_start")
    p2_end = args.get("period2_end")

    events = data.get("events", {})
    matching_key, event_data = find_event(events, event_name)

    if not matching_key:
        return json.dumps({"error": f"Event '{event_name}' not found"})

    def period_total(start, end):
        return sum(v for d, v in event_data.items() if start <= d <= end)

    p1_total = period_total(p1_start, p1_end)
    p2_total = period_total(p2_start, p2_end)
    change = p1_total - p2_total
    change_pct = (change / p2_total * 100) if p2_total > 0 else 0

    return json.dumps({
        "event": matching_key,
        "period1": {"range": f"{p1_start} to {p1_end}", "total": p1_total},
        "period2": {"range": f"{p2_start} to {p2_end}", "total": p2_total},
        "comparison": {
            "absolute_change": change,
            "percent_change": f"{change_pct:+.1f}%",
            "trend": "up" if change > 0 else "down" if change < 0 else "flat"
        }
    }, indent=2)


# Tool dispatcher
TOOL_FUNCTIONS = {
    "get_business_summary": tool_get_business_summary,
    "get_metric_data": tool_get_metric_data,
    "get_daily_trend": tool_get_daily_trend,
    "calculate_conversion": tool_calculate_conversion,
    "compare_periods": tool_compare_periods,
}


def execute_tool(name: str, args: Dict) -> str:
    """Execute a tool by name."""
    if name in TOOL_FUNCTIONS:
        return TOOL_FUNCTIONS[name](args)
    return json.dumps({"error": f"Unknown tool: {name}"})


# ============= SYSTEM PROMPT =============

SYSTEM_PROMPT = """You are the **Business AI Coordinator** for ZUAI (Scan & Learn), an AI education app.

## Your Role
You are an AI Chief of Staff providing business intelligence. You have access to Mixpanel analytics data and MUST use your tools to answer questions with real data.

## IMPORTANT: Always Use Tools
- NEVER make up numbers or guess data
- ALWAYS call tools to get real data before answering
- Start with get_business_summary if you need to know what metrics are available
- Use multiple tools if needed to fully answer the question

## Available Tools
1. **get_business_summary** - Overview of all metrics (use first to see what's available!)
2. **get_metric_data** - Detailed data for a specific event with stats
3. **get_daily_trend** - Day-over-day changes for recent days
4. **calculate_conversion** - Funnel conversion between two events
5. **compare_periods** - Compare metrics between time periods

## Business Context
- **Product**: ZUAI - Mobile app where students scan homework problems, AI explains step-by-step
- **Model**: Freemium with subscription
- **Key Events**: signup_completed, dashboard_viewed, chat_messages, subscription_order_initiated, welcome_screen_viewed

## Response Format
After gathering data with tools, provide:
1. **TL;DR** - One sentence answer
2. **Key Numbers** - The specific metrics
3. **Insight** - What it means
4. **Recommendation** - What to do (if applicable)

Current date: 2026-01-30
"""


# ============= AGENT LOOP =============

@dataclass
class AgentEvent:
    """Event emitted during agent execution."""
    type: str  # 'thinking', 'tool_call', 'tool_result', 'response', 'error'
    content: Any


def run_agent(user_message: str, messages: List[Dict] = None) -> Generator[AgentEvent, None, List[Dict]]:
    """
    Run the agent with tool calling support.
    Yields events during execution for real-time feedback.
    Returns the updated message history.
    """
    if messages is None:
        messages = []

    # Add system prompt if not present
    if not messages or messages[0].get('role') != 'system':
        messages.insert(0, {"role": "system", "content": SYSTEM_PROMPT})

    # Add user message
    messages.append({"role": "user", "content": user_message})

    iteration = 0

    while iteration < MAX_ITERATIONS:
        iteration += 1

        yield AgentEvent(type='thinking', content=f'Iteration {iteration}: Calling LLM...')

        # Call the model
        try:
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages,
                tools=TOOLS,
                tool_choice="auto",
                temperature=0.7,
                max_tokens=4096
            )
        except Exception as e:
            yield AgentEvent(type='error', content=f'API Error: {e}')
            break

        choice = response.choices[0]
        message = choice.message

        # Check if we have tool calls
        if message.tool_calls:
            # Add assistant message with tool calls
            messages.append({
                "role": "assistant",
                "content": message.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    }
                    for tc in message.tool_calls
                ]
            })

            # Execute each tool call
            for tool_call in message.tool_calls:
                tool_name = tool_call.function.name
                try:
                    tool_args = json.loads(tool_call.function.arguments)
                except json.JSONDecodeError:
                    tool_args = {}

                yield AgentEvent(
                    type='tool_call',
                    content={'name': tool_name, 'args': tool_args}
                )

                # Execute the tool
                tool_result = execute_tool(tool_name, tool_args)

                yield AgentEvent(
                    type='tool_result',
                    content={'name': tool_name, 'result': tool_result}
                )

                # Add tool result to messages
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": tool_result
                })

            # Continue loop to get next response
            continue

        # No tool calls - we have a final response
        if message.content:
            yield AgentEvent(type='response', content=message.content)
            messages.append({"role": "assistant", "content": message.content})

        break

    return messages


# ============= INTERACTIVE CLI =============

def main():
    """Run the Business AI agent interactively."""
    print("=" * 70)
    print("🤖 Business AI Agent")
    print("=" * 70)
    print(f"Model: {MODEL_NAME}")
    print(f"API: MuleRouter")
    print("Commands: 'quit' to exit, 'clear' to reset conversation")
    print("=" * 70)
    print()

    messages = []

    while True:
        try:
            user_input = input("\n📝 You: ").strip()

            if not user_input:
                continue
            if user_input.lower() == 'quit':
                print("Goodbye!")
                break
            if user_input.lower() == 'clear':
                messages = []
                print("✅ Conversation cleared.")
                continue

            print()

            # Run agent and display events
            for event in run_agent(user_input, messages):
                if event.type == 'thinking':
                    print(f"💭 {event.content}")

                elif event.type == 'tool_call':
                    print(f"\n🔧 Calling tool: {event.content['name']}")
                    print(f"   Args: {json.dumps(event.content['args'], indent=2)}")

                elif event.type == 'tool_result':
                    result = event.content['result']
                    # Truncate long results for display
                    if len(result) > 500:
                        result = result[:500] + "..."
                    print(f"   📊 Result: {result}")

                elif event.type == 'response':
                    print(f"\n🤖 Assistant:\n{event.content}")

                elif event.type == 'error':
                    print(f"\n❌ Error: {event.content}")

        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")


if __name__ == '__main__':
    main()
