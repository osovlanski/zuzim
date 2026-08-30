import { NextRequest, NextResponse } from 'next/server';
import { sendDailySummary } from '@/lib/telegram';
import { authorizeCronRequest } from '@/lib/security';

// Trigger a Telegram daily summary message.
// Protect with CRON_SECRET env var passed as a Bearer token.
// Example cron: 0 20 * * * curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/daily-summary
export async function GET(request: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET;
  if (!authorizeCronRequest(request.headers.get('authorization'), cronSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await sendDailySummary();
    return NextResponse.json({ success: true, sentAt: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
