/**
 * Chat API Route Example
 *
 * This should be placed in: app/api/chat/route.ts
 *
 * Handles incoming chat requests and streams responses from the coordinator agent.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runCoordinator } from '@/lib/agents/coordinator';
import { createSession, createMessage, getUserByEmail } from '@/lib/db/client';
import { createMixpanelMCP } from '@/lib/mcp/mixpanel';
import { createGoogleAnalyticsMCP } from '@/lib/mcp/google-analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, userEmail } = body;

    if (!message || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: message, userEmail' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = getUserByEmail(userEmail);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create or resume session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      // Generate new session ID
      currentSessionId = `session_${Date.now()}_${user.id}`;
      createSession(currentSessionId, user.id);
    }

    // Save user message to database
    createMessage(currentSessionId, 'user', message);

    // Initialize MCP servers with user's credentials
    // In production, fetch these from the database (encrypted)
    const mcpServers = {
      ...(process.env.MIXPANEL_API_SECRET && {
        mixpanel: createMixpanelMCP({
          projectId: process.env.MIXPANEL_PROJECT_ID!,
          apiSecret: process.env.MIXPANEL_API_SECRET!,
        }),
      }),
      ...(process.env.GA4_PROPERTY_ID && {
        'google-analytics': createGoogleAnalyticsMCP({
          propertyId: process.env.GA4_PROPERTY_ID!,
          credentials: JSON.parse(process.env.GA4_CREDENTIALS!),
        }),
      }),
    };

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let assistantResponse = '';
          let agentId = 'coordinator';

          // Run coordinator agent
          for await (const message of runCoordinator(
            body.message,
            user.team,
            currentSessionId,
            mcpServers
          )) {
            // Handle different message types
            if (message.type === 'agent' && message.text) {
              assistantResponse += message.text;

              // Stream chunk to client
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'text',
                    content: message.text,
                  })}\n\n`
                )
              );
            } else if ('result' in message) {
              assistantResponse = message.result;

              // Stream final result
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'result',
                    content: message.result,
                  })}\n\n`
                )
              );
            } else if (message.type === 'tool_use') {
              // Track which agent was used
              if (message.tool_name === 'Task') {
                agentId = message.input?.agent || 'coordinator';
              }

              // Stream tool use notification
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'tool',
                    tool: message.tool_name,
                    agent: agentId,
                  })}\n\n`
                )
              );
            } else if (message.type === 'error') {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'error',
                    content: message.text,
                  })}\n\n`
                )
              );
            }
          }

          // Save assistant response to database
          if (assistantResponse) {
            createMessage(
              currentSessionId,
              'assistant',
              assistantResponse,
              agentId
            );
          }

          // Send session ID to client
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'session',
                sessionId: currentSessionId,
              })}\n\n`
            )
          );

          // Close stream
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Error in agent stream:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                content: 'An error occurred while processing your request.',
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve chat history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId parameter' },
        { status: 400 }
      );
    }

    // Get messages from database
    const { getSessionMessages } = await import('@/lib/db/client');
    const messages = getSessionMessages(sessionId);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
