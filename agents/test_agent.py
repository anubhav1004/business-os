#!/usr/bin/env python3
"""Quick test script for the Business AI agent."""

import sys
sys.path.insert(0, '.')

from business_agent import run_agent, AgentEvent
import json

def test_query(query: str):
    print(f"Query: {query}")
    print("=" * 60)

    messages = []
    for event in run_agent(query, messages):
        if event.type == 'thinking':
            print(f"💭 {event.content}")

        elif event.type == 'tool_call':
            print(f"\n🔧 Tool: {event.content['name']}")
            print(f"   Args: {json.dumps(event.content['args'])}")

        elif event.type == 'tool_result':
            result = event.content['result']
            if len(result) > 300:
                result = result[:300] + "..."
            print(f"   📊 Result: {result}")

        elif event.type == 'response':
            print(f"\n{'='*60}")
            print(f"🤖 Response:\n{event.content}")

        elif event.type == 'error':
            print(f"\n❌ Error: {event.content}")

if __name__ == '__main__':
    query = sys.argv[1] if len(sys.argv) > 1 else "What were our signups yesterday?"
    test_query(query)
