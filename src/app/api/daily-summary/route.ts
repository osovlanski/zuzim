import { NextRequest, NextResponse } from 'next/server';
import { sendDailySummary } from '@/lib/telegram';

// Trigger a Telegram daily summary message.
// Protect with CRON_SECRET env var — pass as Bearer token or ?secret= query param.
// Example cron: 0 20 * * * curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/daily-summary
export async function GET(request: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    const querySecret = request.nextUrl.searchParams.get('secret');
    const isAuthorized = authHeader === `Bearer ${cronSecret}` || querySecret === cronSecret;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    await sendDailySummary();
    return NextResponse.json({ success: true, sentAt: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
