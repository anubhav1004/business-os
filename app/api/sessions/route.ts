/**
 * Sessions API Route
 *
 * Handles session management (list, create, delete sessions)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserSessions, getUserByEmail } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sessions
 * Get all sessions for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Missing userEmail parameter' },
        { status: 400 }
      );
    }

    const user = getUserByEmail(userEmail);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const sessions = getUserSessions(user.id);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
