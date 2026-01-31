/**
 * Chat API Route - Agentic System
 *
 * Streams agent responses with tool calls visible to the frontend.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '@/lib/ai/agent';
import { createSession, createMessage, getUserByEmail } from '@/lib/db/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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
      currentSessionId = `session_${Date.now()}_${user.id}`;
      createSession(currentSessionId, user.id);
    }

    // Save user message to database
    createMessage(currentSessionId, 'user', message);

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';
          const toolCalls: any[] = [];

          // Run the agent
          for await (const event of runAgent(message)) {
            switch (event.type) {
              case 'thinking':
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'thinking',
                      content: event.content,
                    })}\n\n`
                  )
                );
                break;

              case 'tool_call':
                toolCalls.push(event.content);
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'tool_call',
                      tool: event.content.name,
                      args: event.content.args,
                      id: event.content.id,
                    })}\n\n`
                  )
                );
                break;

              case 'tool_result':
                // Parse and send tool result
                let resultPreview = event.content.result;
                try {
                  const parsed = JSON.parse(resultPreview);
                  // Create a shorter preview for the UI
                  if (parsed.stats) {
                    resultPreview = JSON.stringify(parsed.stats);
                  } else if (parsed.summary) {
                    resultPreview = JSON.stringify(parsed.summary);
                  }
                } catch {
                  // Keep original if not JSON
                }

                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'tool_result',
                      tool: event.content.name,
                      result: resultPreview,
                      id: event.content.id,
                    })}\n\n`
                  )
                );
                break;

              case 'text':
                fullResponse += event.content;
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'text',
                      content: event.content,
                    })}\n\n`
                  )
                );
                break;

              case 'error':
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'error',
                      content: event.content,
                    })}\n\n`
                  )
                );
                break;

              case 'done':
                // Save assistant response to database
                if (fullResponse) {
                  createMessage(
                    currentSessionId,
                    'assistant',
                    fullResponse,
                    'coordinator',
                    { toolCalls }
                  );
                }
                break;
            }
          }

          // Send session info
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'session',
                sessionId: currentSessionId,
              })}\n\n`
            )
          );

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Error in agent stream:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                content: error instanceof Error ? error.message : 'An error occurred',
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
        Connection: 'keep-alive',
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
